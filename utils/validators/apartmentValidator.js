const { check, body } = require("express-validator");
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

  check("neighborhood").notEmpty().withMessage("Neighborhood is required"),

  check("city").notEmpty().withMessage("City is required"),

  //check("district").notEmpty().withMessage("District is required"),

  check("category").notEmpty().withMessage("Category is required"),

  check("property_type")
    .notEmpty()
    .withMessage("Property type is required")
    .isIn([
      "apartment",
      "villa",
      "land",
      "agricultural-Land",
      "industrial-Land",
      "farm",
      "shop",
      "architecture",
    ])
    .withMessage("Invalid property type"),

  check("property_deed_type")
    .notEmpty()
    .withMessage("Property Deed type is required")
    .isIn([
      "green",
      "courtRolling",
      "municipal",
      "farm",
      "industrial",
      "aqricvltural",
    ])
    .withMessage("Invalid property Deed type"),

  check("property_size")
    .notEmpty()
    .withMessage("Property size is required")
    .isNumeric()
    .withMessage("Property size must be a number"),

  check("room")
    .notEmpty()
    .withMessage("Number of rooms is required")
    .isInt({ min: 0 })
    .withMessage("Rooms must be at least 1"),

  check("bathrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Bathrooms must be a non-negative number"),

  check("property_age")
    .optional()
    .isNumeric()
    .withMessage("Property age must be a number"),

  check("floor")
    .notEmpty()
    .withMessage("Number of floor is required")
    .isInt({ min: -2 })
    .withMessage("Floor must be -2 or higher"),

  check("stock")
    .notEmpty()
    .withMessage("Number of stock is required")
    .isInt({ min: 0, max: 2400 })
    .withMessage("The number of stocks cannot be more than 2400"),

  // check("images")
  //   .isMongoId()
  //   .withMessage("At least one image is required"),

  check("status")
    .optional()
    .isIn(["available", "rented", "sold"])
    .withMessage("Invalid status"),

  check("phoneOwner")
    .notEmpty()
    .withMessage("phoneOwner is required")
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),

  check("phoneCountryCode")
    .notEmpty()
    .withMessage("phoneCountryCode is required")
    .matches(/^\+\d{1,4}$/)
    .withMessage("Invalid country code format, e.g., +963 or +966"),

  check("postStatus")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid post status"),

  check("isFavorite")
    .optional()
    .isBoolean()
    .withMessage("isFavorite must be Boolean like : (true or false)"),

  check("isFeature")
    .optional()
    .isBoolean()
    .withMessage("isFeature must be Boolean like : (true or false)"),

  check("location.type")
    .optional()
    .equals("Point")
    .withMessage("Location type must be 'Point'"),

  check("location.coordinates").custom((value, { req }) => {
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
