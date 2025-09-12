const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const createToken = require("../utils/creatToken");
const { sanitizeUser } = require("../utils/sanitizeData");
const sendEmail = require("../utils/sendEmail");

// ======================
// ✅ إنشاء حساب
// ======================
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, phoneCountryCode } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError("Email already in use", 400));
  }

  const user = await User.create({
    name,
    email,
    phone,
    phoneCountryCode,
    password,
  });

  const token = createToken(user._id);

  res.status(201).json({
    message: "Account created successfully.",
    data: sanitizeUser(user),
    token,
  });
});

// ======================
// ✅ إرسال كود التحقق إلى الإيميل
// ======================
exports.signupSendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("No user found with this email", 400));
  }

  // تحقق من وقت الطلب التالي
  if (user.otpNextAllowedAt && user.otpNextAllowedAt > Date.now()) {
    return res.status(200).json({
      status: "failure",
      message: "Please wait before requesting a new verification code.",
      nextRequestAt: new Date(user.otpNextAllowedAt).toISOString(),
    });
  }

  // توليد الكود وتشفيره
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const hashedCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");

  if (process.env.NODE_ENV !== "production") {
    console.log("Verification code (dev):", verificationCode);
  }

  // حساب التأخير القادم
  const delaySchedule = [10, 15, 30, 1440]; // بالدقائق
  const currentCount = user.otpRequestCount || 0;
  const delayIndex = currentCount % delaySchedule.length;
  const delayInMs = delaySchedule[delayIndex] * 60 * 1000;
  const nextAllowedTime = Date.now() + delayInMs;

  // تحديث معلومات المستخدم
  user.emailVerificationCode = hashedCode;
  user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 دقائق
  user.otpRequestCount = currentCount + 1;
  user.otpLastSentAt = Date.now();
  user.otpNextAllowedAt = nextAllowedTime;

  await user.save();

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Hello ${user.name},</h2>
      <p style="font-size: 16px; color: #555;">
        Thank you for signing up! Your email verification code is:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 32px; color: #000; font-weight: bold; background-color: #f1f1f1; padding: 15px 30px; border-radius: 6px;">
          ${verificationCode}
        </span>
      </div>
      <p style="font-size: 14px; color: #777;">
        This code is valid for <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this message.
      </p>
      <p style="font-size: 14px; color: #777; margin-top: 40px;">
        Best regards,<br />
        <strong>Your App Team</strong>
      </p>
    </div>
  </div>
`;

  await sendEmail({
    email: user.email,
    subject: "Email Verification Code",
    html,
  });

  res.status(201).json({
    status: "success",
    message: `Verification code sent to your email: ${email}`,
    nextRequestAt: new Date(nextAllowedTime).toISOString(),
  });
});

// ======================
// ✅ التحقق من كود البريد الإلكتروني
// ======================
exports.verifyEmailCode = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  // تحقق من وجود حظر مؤقت بسبب المحاولات الخاطئة
  if (
    user.emailVerificationLockedUntil &&
    user.emailVerificationLockedUntil > Date.now()
  ) {
    const minutesLeft = Math.ceil(
      (user.emailVerificationLockedUntil - Date.now()) / 60000
    );
    return next(
      new ApiError(
        `Too many attempts. Try again in ${minutesLeft} minute(s).`,
        429
      )
    );
  }

  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

  const isCodeValid =
    user.emailVerificationCode === hashedCode &&
    user.emailVerificationExpires &&
    user.emailVerificationExpires > Date.now();

  if (!isCodeValid) {
    user.emailVerificationAttempts += 1;

    // إذا تجاوز عدد المحاولات المسموح به
    if (user.emailVerificationAttempts >= 5) {
      user.emailVerificationPenaltyLevel += 1;

      const lockDurations = [10, 15, 30, 1440]; // دقائق
      const level = Math.min(
        user.emailVerificationPenaltyLevel,
        lockDurations.length - 1
      );
      const lockTime = lockDurations[level] * 60 * 1000;

      user.emailVerificationLockedUntil = Date.now() + lockTime;
      user.emailVerificationAttempts = 0;
    }

    await user.save();
    return next(new ApiError("Invalid or expired verification code", 400));
  }

  // ✅ نجاح التحقق
  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  user.emailVerificationAttempts = 0;
  user.emailVerificationLockedUntil = undefined;
  user.emailVerificationPenaltyLevel = 0;

  await user.save();

  res.status(200).json({
    data: sanitizeUser(user),
    message: "Email verified successfully. You can now log in.",
  });
});

// ======================
// ✅ تسجيل الدخول
// ======================
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // للتشغيل بدون التحقق من الإيميل، علّق هذا الشرط
  // if (!user.isEmailVerified) {
  //   return next(new ApiError("Please verify your email to login", 401));
  // }

  const token = createToken(user._id);

  res.status(200).json({
    data: sanitizeUser(user),
    token,
  });
});
