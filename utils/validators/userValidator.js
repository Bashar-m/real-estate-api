const slugify = require("slugify");
const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../../models/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
//admin
exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user ID format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name is too short")
    .isLength({ max: 50 })
    .withMessage("Name is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("Email already in use");
      }
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password is too short")
    .isLength({ max: 32 })
    .withMessage("Password is too long")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  check("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number")
    .custom(async (val) => {
      const user = await User.findOne({ phone: val });
      if (user) {
        throw new Error("Phone number already in use");
      }
    }),

  check("profileImg").optional().isString(),
  check("role").optional().isIn(["user", "admin"]),

  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user ID format"),

  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name is too short")
    .isLength({ max: 50 })
    .withMessage("Name is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("Email already in use");
      }
    }),
  check("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number")
    .custom(async (val) => {
      const user = await User.findOne({ phone: val });
      if (user) {
        throw new Error("Phone number already in use");
      }
    }),
  check("profileImg").optional().isString(),
  check("role").optional().isIn(["user", "admin"]),

  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  body("password")
    .notEmpty()
    .withMessage("New password is required")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("No user found for this ID");
      }

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isCorrectPassword) {
        throw new Error("Current password is incorrect");
      }

      if (val !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match");
      }

      return true;
    }),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user ID format"),
  validatorMiddleware,
];

//user access
exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name is too short")
    .isLength({ max: 50 })
    .withMessage("Name is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number")
    // .custom(async (val) => {
    //   const user = await User.findOne({ phone: val });
    //   if (user) {
    //     throw new Error("Phone number already in use");
    //   }
    //}),
    ,
    check("phoneCountryCode")
    .optional()
    ,
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  body("password")
    .notEmpty()
    .withMessage("New password is required")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new Error("No user found for this ID");
      }

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isCorrectPassword) {
        throw new Error("Current password is incorrect");
      }

      if (val !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match");
      }

      return true;
    }),

  validatorMiddleware,
];