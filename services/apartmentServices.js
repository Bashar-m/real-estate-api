
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const Apartment = require("../models/apartmentModel");
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
exports.getApartmentList = getAll(Apartment);
exports.getApartmentById = getOne(Apartment);
exports.updateapartmentById = updateOne(Apartment);
exports.deleteApartmentById = deleteOne(Apartment);

exports.getApartmentByMap = asyncHandler(async (req, res, next) => {
  let { lng, lat, distance } = req.query;

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

  const radius = distance / 6378.1;

  const geoFilter = {
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  };

  const features = new ApiFeatures(Apartment.find(geoFilter), req.query)
    .filter()
    .sort()
    .search()
    .limitfields();

  const countDocuments = await Apartment.countDocuments({
    ...geoFilter,
    ...features.getFilterObject(),
  });

  features.paginate(countDocuments);
  const apartments = await features.mongooseQuery;

  res.status(200).json({
    status: "success",
    results: apartments.length,
    pagination: features.paginationResult,
    data: apartments,
  });
});
