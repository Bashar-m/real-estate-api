const fs = require("fs");
const path = require("path");

const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const Apartment = require("../models/apartmentModel");
const appBanner = require("../models/appBannerModel");
const Image = require("../models/imageModel");
const ApiError = require("../utils/apiError");

// Multer & sharp middleware
exports.uploadApartmentImages = uploadMixOfImages([
  { name: "images", maxCount: 6 },
]);
exports.uploadBannerImage = uploadMixOfImages([
  { name: "image", maxCount: 1 },
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

  const apartment = await Apartment.findById(apartmentId);
  if (!apartment) {
    return next(new ApiError("Apartment not found", 404));
  }

  if (!req.files.images || req.files.images.length === 0) {
    return next(new ApiError("No images uploaded", 400));
  }

  const uploadDir = path.join(__dirname, "../uploads/apartments");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const images = await Promise.all(
    req.files.images.map(async (img, index) => {
      const imageName = `apartment-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 80 })
        .toFile(path.join(uploadDir, imageName));

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

exports.addImageToBanner = asyncHandler(async (req, res, next) => {
  const bannerId = req.params.id;

  const banner = await appBanner.findById(bannerId);
  if (!banner) {
    return next(new ApiError("Banner not found", 404));
  }

  if (!req.files.image || req.files.image.length === 0) {
    return next(new ApiError("No image uploaded", 400));
  }

  const uploadDir = path.join(__dirname, "../uploads/banner");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const img = req.files.image[0];
  const imageName = `banner-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(img.buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 80 })
    .toFile(path.join(uploadDir, imageName));

  const newImage = await Image.create({
    name: imageName,
    path: `uploads/banner/${imageName}`,
  });

  // استبدال الصورة القديمة بالجديدة
  banner.image = newImage._id;
  await banner.save();

  res.status(200).json({
    status: "success",
    data: banner,
  });
});

//gettttt images for apartment
exports.getBannerImage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const banner = await appBanner.findById(id).populate("image");
  if (!banner) {
    return next(new ApiError("Banner not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: banner.image,
  });
});
