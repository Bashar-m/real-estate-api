const multer = require("multer");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  // const multerFilter = function (req, file, cb) {
  //   console.log(file)
  //   if (file.mimetype.startsWith('image')) {
  //     cb(null, true);
  //   } else {
  //     cb(new ApiError('Only Images allowed', 400), false);
  //   }

  // };

  const upload = multer({
    storage: multerStorage /*fileFilter : multerFilter*/,
  });

  return upload;
};

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
