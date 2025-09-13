const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createHelpUserValidator = [
  check("title")
    .notEmpty()
    .withMessage("title is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("videoUrl")
    .optional()
    .isURL({ protocols: ["https"], host_whitelist: ["www.youtube.com"] })
    .withMessage("Invalid video url, only youtube url is allowed"),
  validatorMiddleware,
];

exports.updateHelpUserValidator = [
  check("id").isMongoId().withMessage("Invalid help user id format"),
  check("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("videoUrl")
    .optional()
    .isURL({ protocols: ["https"], host_whitelist: ["www.youtube.com"] })
    .withMessage("Invalid video url, only youtube url is allowed"),
  validatorMiddleware,
];

exports.deleteHelpUserValidator = [
  check("id").isMongoId().withMessage("Invalid help user id format"),
  validatorMiddleware,
];
