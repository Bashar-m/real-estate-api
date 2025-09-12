const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const multer = require("multer");

const HelpUser = require("../models/helpUserModel");
const Image = require("../models/imageModel");

const { createOne, getAll } = require("../services/handlersFactory");

const uploadDir = path.join(__dirname, "../uploads/helpUser");
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

exports.uploadHelpUserImages = upload.fields([
  { name: "helpCover", maxCount: 1 },
]);

exports.resizeHelpUserImages = asyncHandler(async (req, res, next) => {
  if (req.files.helpCover) {
    const img = req.files.helpCover[0];
    const imageName = `helpUser-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(img.buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(path.join(uploadDir, imageName));

    req.body.helpCover = imageName;
  }
  next();
});

//  CRUD
exports.createHelpUser = createOne(HelpUser);
exports.getHelpUser = getAll(HelpUser);

// تحديث مع حذف الصورة القديمة لو تم استبدالها
exports.updateHelpUserById = asyncHandler(async (req, res, next) => {
  const helpUser = await HelpUser.findById(req.params.id);
  if (!helpUser) {
    return res.status(404).json({ message: "helpUserInfo not found" });
  }

  // إذا فيه صورة جديدة
  if (req.body.helpCover) {
    if (helpUser.helpCover) {
      // نجيب الصورة القديمة من جدول Image
      const oldImage = await Image.findById(helpUser.helpCover);
      if (oldImage) {
        const oldPath = path.join(__dirname, "../", oldImage.path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // نحذفها من السيرفر
        }
        await oldImage.deleteOne(); // نحذفها من الـ DB
      }
    }
  }

  const updated = await HelpUser.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ data: updated });
});

exports.deleteHelpUserById = asyncHandler(async (req, res, next) => {
  const helpUser = await HelpUser.findById(req.params.id);
  if (!helpUser) {
    return res.status(404).json({ message: "helpUserInfo not found" });
  }

  if (helpUser.helpCover) {
    const oldImage = await Image.findById(helpUser.helpCover);
    if (oldImage) {
      const oldPath = path.join(__dirname, "../", oldImage.path);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      await oldImage.deleteOne();
    }
  }

  await helpUser.deleteOne();
  res.status(204).send();
});
