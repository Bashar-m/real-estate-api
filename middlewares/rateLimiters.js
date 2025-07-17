const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  message: { error: "Too many login attempts. Try again after 15 minutes." },
});

exports.signupLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 3,
  message: { error: "Too many signup attempts. Please wait 30 minutes." },
});

exports.forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  message: { error: "Too many reset requests. Please wait 15 minutes." },
});

exports.verifyEmailCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many verification attempts from this IP. Please wait 15 minutes." }
});

exports.verifyResetCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات كحد أقصى
  message: {
    message: "Too many verification attempts. Please wait 15 minutes.",
    statusCode: 429,
  },
});