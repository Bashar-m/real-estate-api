const fs = require("fs");
const path = require("path");

const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const createToken = require("../utils/creatToken");
const User = require("../models/userModel");

const {
  sanitizeUser,
  sanitizeUserApartment,
} = require("../utils/sanitizeData");

const {
  createOne,
  getAll,
  getOne,
  deleteOne,
} = require("../services/handlersFactory");

const Apartment = require("../models/apartmentModel");
const Image = require("../models/imageModel");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const ApiFeatures = require("../utils/apiFeatures");

//***************************************************************************** */
//protect (Admin)
// Multer & sharp middleware
exports.uploadUserImages = uploadMixOfImages([
  { name: "profileImg", maxCount: 1 },
]);

exports.resizeUserImages = asyncHandler(async (req, res, next) => {
  if (req.files && req.files.profileImg && req.files.profileImg[0]) {
    const imageName = `user-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.files.profileImg[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${imageName}`);

    //string not array
    req.body.profileImg = imageName;
  }

  next();
});

exports.createUser = createOne(User);

exports.getUsers = getAll(User);

exports.getUserById = getOne(User);
exports.getUserByIdForUser = asyncHandler(async (req, res, next) => {
  const document = await User.findById(req.params.id);
  if (!document) return next(new ApiError("No document found", 404));
  res.status(200).json({ status: "success", data: sanitizeUser(document) });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document  for this id:${req.params.id}`), 404);
  }

  res.status(200).json({ data: sanitizeUser(document) });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document  for this id:${req.params.id}`), 404);
  }

  res.status(200).json({ data: sanitizeUser(document) });
});

exports.deleteUser = deleteOne(User);

//**********************************************************************************8 */

//Logged User
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPass = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`No document  for this id:${req.params.id}`), 404);
  }

  const token = createToken(user._id);

  res.status(200).json({ data: sanitizeUser(user), token });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateuser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
      phoneCountryCode: req.body.phoneCountryCode,
    },
    { new: true }
  );

  res.status(200).json({ status: "success", data: sanitizeUser(updateuser) });
});

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);
  res.status(204).json({ message: "Acount is deleted" });
});

//******************************************************************************* */
// C R U D (Apartmennt) For User And Hi SALEEEEEEEEEEEM (:D)
exports.uploadApartmentImages = uploadMixOfImages([
  { name: "images", maxCount: 20 },
]);
exports.createUserApartment = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const newApartment = await (
    await Apartment.create({ ...req.body, owner: userId })
  ).populate("city");

  console.log(newApartment);

  const user = await User.findByIdAndUpdate(
    userId,
    { $push: { myApartment: newApartment._id } },
    { new: true }
  );

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  res.status(201).json({
    status: "success",
    data: newApartment,
  });
});

exports.getUserApartment = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  let apiFeatures = new ApiFeatures(
    Apartment.find({ owner: userId }).populate("city"),
    req.query
  )
    .filter()
    .search()
    .applyFilters()
    .sort()
    .limitfields();

  let countQuery = apiFeatures.cloneQuery();
  const totalResult = await countQuery.countDocuments();

  apiFeatures = apiFeatures.paginate(totalResult);

  const apartments = await apiFeatures.mongooseQuery;

  res.status(200).json({
    status: "success",
    results: apartments.length,
    totalResult,
    pagination: apiFeatures.paginationResult,
    data: apartments,
  });
});

exports.updateUserApartment = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { id } = req.params;

  const apartment = await Apartment.findOne({ _id: id, owner: userId });
  if (!apartment) {
    return next(new ApiError("Apartment not found", 404));
  }

  if (apartment.postStatus === "approved") {
    return next(
      new ApiError("You can't update the apartment after it's approved", 400)
    );
  }

  const updatedApartment = await (
    await Apartment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
  ).populate("city");

  res.status(200).json({
    status: "success",
    data: updatedApartment,
  });
});

exports.deleteUserApartment = asyncHandler(async (req, res, next) => {
  const apId = req.params.id;
  const userId = req.user._id;

  const apartment = await Apartment.findOneAndDelete({
    _id: apId,
    owner: userId,
  });

  if (!apartment) {
    return next(new ApiError("Apartment not found or not authorized", 404));
  }

  // حذف الصور من السيرفر وDB
  if (apartment.images && apartment.images.length > 0) {
    const images = await Image.find({ _id: { $in: apartment.images } });

    await Promise.all(
      images.map(async (img) => {
        const filePath = path.join(__dirname, "../", img.path);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      })
    );

    await Image.deleteMany({ _id: { $in: apartment.images } });
  }

  // حذف المرجع من المستخدم
  await User.findByIdAndUpdate(userId, {
    $pull: { myApartment: apId },
  });

  res.status(200).json({
    status: "success",
    message: "Apartment deleted successfully",
  });
});

exports.getUserApartmentById = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { id } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const apartments = await Apartment.find({ owner: userId, _id: id }).populate(
    "city"
  );

  if (!apartments || apartments.length === 0) {
    return next(new ApiError("Apartment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: apartments,
  });
});
