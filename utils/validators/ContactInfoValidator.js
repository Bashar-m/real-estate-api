const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createContactInfoValidator = [
  check("type")
    .notEmpty()
    .withMessage("type of contact Info is required")
    .isIn(["call", "whatsapp", "telegram", "facebook", "instagram"])
    .withMessage("Invalid property Deed type"),

  check("value").notEmpty().withMessage("value of contact Info is required"),

  check("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.updateContactInfoValidator = [
  check("id").isMongoId().withMessage("Invalid contact Info id format"),
  check("type")
    .optional()
    .isIn(["call", "whatsapp", "telegram", "facebook", "instagram"])
    .withMessage("Invalid contact Info type"),

  check("value").optional(),

  check("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteContactInfoValidator = [
  check("id").isMongoId().withMessage("Invalid contact Info id format"),
  validatorMiddleware,
];
