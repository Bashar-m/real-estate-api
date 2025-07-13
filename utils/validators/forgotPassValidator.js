const { check } = require("express-validator");

const User = require("../../models/userModel");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.forgotPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (!user) {
        throw new Error("There is no user for this E-mail");
      }
    }),
  ,
  validatorMiddleware,
];

exports.verifyPassResetCodeValidator = [
  check("resetCode")
    .notEmpty()
    .withMessage("Reset code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be 6 digits")
    .isNumeric()
    .withMessage("Reset code must be numeric"),
  validatorMiddleware,
];

exports.resetPasswordValidator = [
  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .isLength({ max: 32 })
    .withMessage("Password must be less than 32 characters"),
  validatorMiddleware,
];
