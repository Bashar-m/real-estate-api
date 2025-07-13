const express = require("express");

const { signup, login, verifyEmailCode } = require("../services/authServices");

const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const {
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../services/forgotPassword");

const {
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyPassResetCodeValidator,
} = require("../utils/validators/forgotPassValidator");

const protect = require("../middlewares/protect");

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/verify-email-code", protect, verifyEmailCode);
router.post("/login", loginValidator, login);
router.post("/forgotPassword",forgotPasswordValidator , forgotPassword);
router.post("/verifyResetCode", protect,resetPasswordValidator, verifyPassResetCode);
router.put("/resetPassword", protect, verifyPassResetCodeValidator,resetPassword);

module.exports = router;
