const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const Apartment = require("../models/apartmentModel");
const Wishlist = require("../models/wishlistModel");
const Image = require("../models/imageModel");

const {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOne,
} = require("../services/handlersFactory");

const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const ApiFeatures = require("../utils/apiFeatures");
const ApiError = require("../utils/apiError");

// Multer & sharp middleware
exports.uploadApartmentImages = uploadMixOfImages([
  { name: "images", maxCount: 20 },
]);

// exports.resizeApartmentImages = asyncHandler(async (req, res, next) => {
//   if (req.files.images) {
//     req.body.images = [];

//     await Promise.all(
//       req.files.images.map(async (img, index) => {
//         const imageName = `apartment-${uuidv4()}-${Date.now()}-${
//           index + 1
//         }.jpeg`;

//         await sharp(img.buffer)
//           .resize(2000, 1333)
//           .toFormat("jpeg")
//           .jpeg({ quality: 95 })
//           .toFile(`uploads/apartments/${imageName}`);

//         const imageDoc = await Image.create({
//           name: imageName,
//           path: `uploads/apartments/${imageName}`,
//         });

//         //  نخزن _id بدل الاسم
//         req.body.images.push(imageDoc._id);
//       })
//     );
//   }
//   next();
// });

//create image for apartment
exports.addImagesToApartment = asyncHandler(async (req, res, next) => {
  const apartmentId = req.params.id;

  // التأكد من وجود الشقة
  const apartment = await Apartment.findById(apartmentId);
  if (!apartment) {
    return next(new ApiError("Apartment not found", 404));
  }

  if (!req.files.images || req.files.images.length === 0) {
    return next(new ApiError("No images uploaded", 400));
  }

  // رفع الصور وتخزينها في موديل Image
  const images = await Promise.all(
    req.files.images.map(async (img, index) => {
      const imageName = `apartment-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 80 })
        .toFile(`uploads/apartments/${imageName}`);

      const newImage = await Image.create({
        name: imageName,
        path: `uploads/apartments/${imageName}`,
      });

      return newImage._id;
    })
  );

  // ربط الصور بالشقة
  apartment.images.push(...images);
  await apartment.save();

  res.status(200).json({
    status: "success",
    data: apartment,
  });
});

//gettttt images for apartment
exports.getApartmentImages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // نجيب الشقة مع الصور
  const apartment = await Apartment.findById(id).populate("images");

  if (!apartment) {
    return next(new ApiError("Apartment not found", 404));
  }

  res.status(200).json({
    status: "success",
    results: apartment.images.length,
    data: apartment.images,
  });
});

//create apartment
exports.createApartment = createOne(Apartment);

exports.getApartmentList = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id; // ✅ قد يكون undefined إذا ما في تسجيل دخول
  const { isFavorite, city } = req.query;

  let apiFeatures;

  if (isFavorite === "true" && userId) {
    // ✅ فقط إذا المستخدم مسجل دخول
    const wishlistItems = await Wishlist.find({ user: userId }).select(
      "apartment"
    );
    const favoriteIds = wishlistItems.map((item) => item.apartment);
    apiFeatures = new ApiFeatures(
      Apartment.find({
        _id: { $in: favoriteIds.map((e) => e._id) },
        postStatus: "approved",
      }).populate("city"),
      {}
    );
  } else {
    apiFeatures = new ApiFeatures(
      Apartment.find({ postStatus: "approved" }).populate("city"),
      req.query
    );
  }

  apiFeatures = apiFeatures
    .filter()
    .search()
    .applyFilters() // 🔹 عشان يطبق الـ find(this.filterObj)
    .sort()
    .limitfields();

  let count = apiFeatures.cloneQuery();
  apiFeatures = apiFeatures.paginate();

  const apartments = await apiFeatures.mongooseQuery;
  const p = await count.countDocuments();

  let apartmentsWithFavorite;

  if (userId) {
    // ✅ أضف isFavorite فقط إذا في user
    const wishlistItems = await Wishlist.find({ user: userId }).select(
      "apartment"
    );
    const favoriteIds = wishlistItems.map((item) => item.apartment.toString());

    apartmentsWithFavorite = apartments.map((apartment) => {
      const isFav = favoriteIds.includes(apartment._id.toString());
      return {
        ...apartment.toObject(),
        isFavorite: isFav,
      };
    });
  } else {
    apartmentsWithFavorite = apartments.map((apartment) =>
      apartment.toObject()
    );
  }

  res.status(200).json({
    status: "success",
    //skip not working
    results: apartmentsWithFavorite.length,
    totalResult: p,
    pagination: {
      ...apiFeatures.paginationResult,
    },
    data: apartmentsWithFavorite,
  });
});

exports.getApartmentById = getOne(Apartment);
exports.updateapartmentById = updateOne(Apartment);
exports.deleteApartmentById = deleteOne(Apartment);

exports.getApartmentByMap = asyncHandler(async (req, res, next) => {
  let feature = new ApiFeatures(
    Apartment.find({ postStatus: "approved" }).populate("city"),
    req.query
  );
  feature = feature
    .filter()
    .search()
    .applyFilters() // 🔹 عشان يطبق الـ find(this.filterObj)
    .sort()
    .limitfields();
  let apartments = await feature.mongooseQuery;
  res.status(200).json({
    status: "success",
    results: apartments.length,
    data: apartments,
  });
});
