const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const Apartment = require("../models/apartmentModel");
const Wishlist = require("../models/wishlistModel");
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

exports.resizeApartmentImages = asyncHandler(async (req, res, next) => {
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `apartment-${uuidv4()}-${Date.now()}-${
          index + 1
        }.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/apartments/${imageName}`);

        req.body.images.push(imageName);
      })
    );
  }
  next();
});

exports.createApartment = createOne(Apartment);

//******************  ----->>>>[ME]<<<<---- ****************** */

// exports.getApartmentList = asyncHandler(async (req, res, next) => {
//   const userId = req.user?._id; //? يعني ممكن  يكون undefind
//   const { isFavorite, city } = req.query;

//   let query;
//   let countQuery;

//   if (isFavorite === "true" && userId) {
//     const wishlistItems = await Wishlist.find({ user: userId }).populate(
//       "apartment"
//     );
//     const favoriteIds = wishlistItems.map((item) => item.apartment);

//     query = Apartment.find({ _id: { $in: favoriteIds } });
//     countQuery = Apartment.countDocuments({ _id: { $in: favoriteIds } });
//   } else if (city) {
//     query = Apartment.find({ city });
//     countQuery = Apartment.countDocuments({ city });
//   } else {
//     query = Apartment.find().populate("city");
//     countQuery = Apartment.countDocuments();
//   }

//   const features = new ApiFeatures(query, req.query)
//     .filter()
//     .sort()
//     .search()
//     .limitfields();

//   const countDocuments = await countQuery;
//   features.paginate(countDocuments);

//   const apartments = await features.mongooseQuery;

//   let apartmentsWithFavorite;
//   if (userId) {
//     const wishlistItems = await Wishlist.find({ user: userId }).populate(
//       "apartment"
//     );
//     const favoriteIds = wishlistItems.map((item) => item.apartment.toString());

//     apartmentsWithFavorite = apartments.map((apartments) => {
//       const isFav = favoriteIds.includes(apartments._id.toString());
//       return {
//         ...apartments.toObject(),
//         isFavorite: isFav,
//       };
//     });
//   } else {
//     apartmentsWithFavorite.map((apartments) => {
//       apartments.toObject();
//     });
//   }

//   res.status(200).json({
//     status: "success",
//     resulte: apartmentsWithFavorite.length,
//     totalResult: countDocuments,
//     pagination: {
//       ...features.paginationResult,
//     },
//     data: apartmentsWithFavorite,
//   });
// });

exports.getApartmentList = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id; // ✅ قد يكون undefined إذا ما في تسجيل دخول
  const { isFavorite, city } = req.query;

  let query;
  let countQuery;

  if (isFavorite === "true" && userId) {
    // ✅ فقط إذا المستخدم مسجل دخول
    const wishlistItems = await Wishlist.find({ user: userId }).select(
      "apartment"
    );
    const favoriteIds = wishlistItems.map((item) => item.apartment);

    query = Apartment.find({ _id: { $in: favoriteIds } });
    countQuery = Apartment.countDocuments({ _id: { $in: favoriteIds } });
  } else if (city) {
    query = Apartment.find({ city });
    countQuery = Apartment.countDocuments({ city });
  } else {
    query = Apartment.find().populate("city");
    countQuery = Apartment.countDocuments();
  }

  const features = new ApiFeatures(query, req.query)
    .filter()
    .search()
    .applyFilters() // 🔹 عشان يطبق الـ find(this.filterObj)
    .sort()
    .limitfields();

  const countDocuments = await countQuery;
  features.paginate(countDocuments);

  const apartments = await features.mongooseQuery;

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
    // ✅ بدون isFavorite
    apartmentsWithFavorite = apartments.map((apartment) =>
      apartment.toObject()
    );
  }

  res.status(200).json({
    status: "success",
    //skip not working
    results: apartmentsWithFavorite.length,
    totalResult: countDocuments,
    pagination: {
      ...features.paginationResult,
    },
    data: apartmentsWithFavorite,
  });
});

exports.getApartmentById = getOne(Apartment);
exports.updateapartmentById = updateOne(Apartment);
exports.deleteApartmentById = deleteOne(Apartment);

exports.getApartmentByMap = asyncHandler(async (req, res, next) => {
  let { lng, lat, distance, city } = req.query;

  if (!lng || !lat || !distance) {
    return next(
      new ApiError("Please provide longitude, latitude, and distance", 400)
    );
  }
  lng = parseFloat(lng);
  lat = parseFloat(lat);
  distance = parseFloat(distance);

  if (isNaN(lng) || isNaN(lat) || isNaN(distance)) {
    return next(
      new ApiError(
        "Longitude, latitude, and distance must be valid numbers",
        400
      )
    );
  }

  // تحويل المسافة إلى نصف قطر كروي (كيلومترات)
  const radius = distance / 6378.1;

  const geoFilter = {
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  };

  if (city) {
    geoFilter.city = city;
  }

  const apartments = await Apartment.find(geoFilter).populate("city");

  res.status(200).json({
    status: "success",
    results: apartments.length,
    data: apartments,
  });
});
