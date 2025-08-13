const { check , body} = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createApartmentValidator = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title is too short")
    .isLength({ max: 100 })
    .withMessage("Title is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description is too short")
    .isLength({ max: 2000 })
    .withMessage("Description is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number"),

  check("city").notEmpty().withMessage("City is required"),

  //check("district").notEmpty().withMessage("District is required"),

  check("category")
    .notEmpty()
    .withMessage("Category is required"),

  check("property_type").notEmpty().withMessage("Property type is required"),

  check("property_size")
    .notEmpty()
    .withMessage("Property size is required")
    .isNumeric()
    .withMessage("Property size must be a number"),

  check("room")
    .notEmpty()
    .withMessage("Number of rooms is required")
    .isInt({ min: 1 })
    .withMessage("Rooms must be at least 1"),

  check("bathrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Bathrooms must be a non-negative number"),

  check("property_age")
    .optional()
    .isNumeric()
    .withMessage("Property age must be a number"),

  check("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),

  check("status")
    .optional()
    .isIn(["available", "rented", "sold"])
    .withMessage("Invalid status"),

  check("location.type")
    .optional()
    .equals("Point")
    .withMessage("Location type must be 'Point'"),

  check("location.coordinates")
  .custom((value, { req }) => {
    let coords = value;

    // تأكد أن الإحداثيات array وأرقام
    if (typeof coords === "string") {
      try {
        coords = JSON.parse(coords);
      } catch {
        throw new Error("Coordinates must be a valid JSON array");
      }
    }

    if (!Array.isArray(coords)) throw new Error("Coordinates must be an array");
    if (coords.length !== 2) throw new Error("Coordinates must be [lng, lat]");

    coords = coords.map(Number);
    if (coords.some(isNaN)) throw new Error("Coordinates must be numbers");

    const [lng, lat] = coords;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90)
      throw new Error("Invalid GPS coordinates");

    // عدل القيمة في req.body
    req.body.location.coordinates = coords;

    return true;
  }),

  validatorMiddleware,
];

exports.getApartmentValidator = [
  check("id").isMongoId().withMessage("Invalid real-estate id format"),
  validatorMiddleware,
];

exports.updateApartmentValidator = [
  check("id").isMongoId().withMessage("Invalid real-estate id format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteApartmentValidator = [
  check("id").isMongoId().withMessage("Invalid real-estate id format"),
  validatorMiddleware,
];
