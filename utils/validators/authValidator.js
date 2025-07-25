const slugify = require("slugify");
const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../../models/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.signupValidator = [
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
    .isMobilePhone("any")
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

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (!user) {
        throw new Error("No user for this E-mail");
      }
    }),
  ,
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 character !"),

  validatorMiddleware,
];
