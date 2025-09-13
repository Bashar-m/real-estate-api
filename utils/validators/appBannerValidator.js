const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createAppBannerValidator = [
  check("value")
    .notEmpty()
    .withMessage("value is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.updateAppBannerValidator = [
  check("id").isMongoId().withMessage("Invalid app banner id format"),
  check("value")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteAppBannerValidator = [
  check("id").isMongoId().withMessage("Invalid app banner id format"),
  validatorMiddleware,
];
