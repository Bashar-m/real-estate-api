const { check} = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createAboutUsValidator = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  ,
  validatorMiddleware,
];

exports.updateAboutUsValidator = [
  check("id").isMongoId().withMessage("Invalid about us id format"),
  check("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
     check("description")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteAboutUsValidator = [
  check("id").isMongoId().withMessage("Invalid about us id format"),
  validatorMiddleware,
];
