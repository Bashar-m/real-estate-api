const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createCityValidator = [
  check("name")
    .notEmpty()
    .withMessage("name of city is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  validatorMiddleware,
];

exports.updateCityValidator = [
  check("id").isMongoId().withMessage("Invalid City id format"),
  check("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteCityValidator = [
  check("id").isMongoId().withMessage("Invalid City id format"),
  validatorMiddleware,
];
