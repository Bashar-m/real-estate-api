const multer = require("multer");
const ApiError = require("../utils/apiError"); 

const multerOptions = () => {
 
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true); // مقبولة
    } else {
      cb(new ApiError("Only images are allowed", 400), false); 
    }
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter, 
  });

  return upload;
};


exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
