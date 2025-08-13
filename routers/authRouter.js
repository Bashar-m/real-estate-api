const express = require("express");

const { signup,signupSendOtp, login, verifyEmailCode } = require("../services/authServices");

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

// ✅ import rate limiters
const {
  signupLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  verifyEmailCodeLimiter,
  verifyResetCodeLimiter,
} = require("../middlewares/rateLimiters");

const router = express.Router();

router.post("/signup", signupLimiter, signup);
router.post("/signup/send-otp" ,signupSendOtp )
router.post(
  "/verify-email-code",
  protect,
  // verifyEmailCodeLimiter, 
  verifyEmailCode
);
router.post("/login", loginLimiter, loginValidator, login);
router.post(
  "/forgotPassword",
  forgotPasswordLimiter,
  forgotPasswordValidator,
  forgotPassword
);
router.post(
  "/verifyResetCode",
  verifyResetCodeLimiter,
  resetPasswordValidator,
  verifyPassResetCode
);


module.exports = router;
