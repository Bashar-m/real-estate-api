const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const createToken = require("../utils/creatToken");
const User = require("../models/userModel");
const { sanitizeUser } = require("../utils/sanitizeData");
const {
  createOne,
  getAll,
  getOne,
  deleteOne,
} = require("../services/handlersFactory");

const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

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
