const fs = require("fs");
const path = require("path");

const asyncHandler = require("express-async-handler");

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

exports.uploadApartmentImages = uploadMixOfImages([
  { name: "images", maxCount: 6 },
]);
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
        status: "available",
      }).populate("city"),
      {}
    );
  } else {
    apiFeatures = new ApiFeatures(
      Apartment.find({ postStatus: "approved", status: "available" }).populate(
        "city"
      ),
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
    results: apartmentsWithFavorite.length,
    totalResult: p,
    pagination: {
      ...apiFeatures.paginationResult,
      numberOfPages: Math.ceil(p / (apiFeatures.paginationResult.limit || 50)),
    },
    data: apartmentsWithFavorite,
  });
});

exports.getApartmentById = getOne(Apartment);
exports.updateapartmentById = updateOne(Apartment);
exports.deleteApartmentById = asyncHandler(async (req, res, next) => {
  const apartment = await Apartment.findById(req.params.id);

  if (!apartment) {
    return next(new ApiError("No apartment found with this ID", 404));
  }

  //  حذف الصور من السيرفر + Image model
  if (apartment.images && apartment.images.length > 0) {
    const images = await Image.find({ _id: { $in: apartment.images } });

    await Promise.all(
      images.map(async (img) => {
        const filePath = path.join(__dirname, `../${img.path}`);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      })
    );

    await Image.deleteMany({ _id: { $in: apartment.images } });
  }

  await apartment.deleteOne();

  res.status(204).json({ status: "success" });
});

exports.getApartmentByMap = asyncHandler(async (req, res, next) => {
  let feature = new ApiFeatures(
    Apartment.find({ postStatus: "approved", status: "available" }).populate(
      "city"
    ),
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

// Add Feature Apatrment
exports.AddFeatureApartment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const status = req.body.status;
  const apartment = await Apartment.findByIdAndUpdate(
    id,
    { isFeature: status },
    { new: true }
  );

  if (!apartment) {
    return next(new ApiError("No apartment on this id"));
  }

  res.status(200).json({ data: apartment });
});
