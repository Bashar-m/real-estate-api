const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const multer = require("multer");

const Banner = require("../models/appBannerModel");
const { createOne, getAll } = require("../services/handlersFactory");

const uploadDir = path.join(__dirname, "../uploads/banner");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter: multerFilter });

exports.uploadBannerImages = upload.fields([{ name: "image", maxCount: 1 }]);

exports.resizeBannerImages = asyncHandler(async (req, res, next) => {
  if (req.files.image) {
    const img = req.files.image[0];
    const imageName = `banner-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(img.buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(path.join(uploadDir, imageName));

    req.body.image = imageName;
  }
  next();
});

//  CRUD
exports.createBanner = createOne(Banner);
exports.getBanner = getAll(Banner);

// تحديث مع حذف الصورة القديمة لو تم استبدالها
exports.updateBannerById = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return res.status(404).json({ message: "Banner not found" });
  }

  // لو في صورة جديدة، احذف القديمة
  if (req.body.image && banner.image) {
    const oldPath = path.join(uploadDir, banner.image);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ data: updated });
});

exports.deleteBannerById = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return res.status(404).json({ message: "Banner not found" });
  }

  // حذف الصورة من السيرفر
  if (banner.image) {
    const oldPath = path.join(uploadDir, banner.image);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  await banner.deleteOne();
  res.status(204).send();
});
