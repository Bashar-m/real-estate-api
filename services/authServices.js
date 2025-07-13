const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const createToken = require("../utils/creatToken");

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError("Email already in use", 400));
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const hashedCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");

  const user = await User.create({
    name,
    email,
    phone,
    password,
    emailVerificationCode: hashedCode,
    emailVerificationExpires: Date.now() + 10 * 60 * 1000,
  });

  const html = `
  <h3>Hello ${user.name},</h3>
  <p>Your verification code is:</p>
  <h2>${verificationCode}</h2>
  <p>This code will expire in 10 minutes.</p>
`;

  await sendEmail({
    email: user.email,
    subject: "Verify Your Email",
    html,
  });
  const token = createToken(user._id);
  res.status(201).json({
    message: "Account created. Verification code sent to email.",
    token,
  });
});

exports.verifyEmailCode = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

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
    user.emailVerificationExpires > Date.now();

  if (!isCodeValid) {
    user.emailVerificationAttempts += 1;

    if (user.emailVerificationAttempts >= 5) {
      user.emailVerificationPenaltyLevel += 1;
      const lockDurations = [10, 15, 30, 1440]; // بالدقائق
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

  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  user.emailVerificationAttempts = 0;
  user.emailVerificationLockedUntil = undefined;
  user.emailVerificationPenaltyLevel = 0;

  await user.save();
  console.log(user._id);
  const token = createToken(user._id);
  res.status(200).json({ message: "Email verified successfully", token });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  if (!user.isEmailVerified) {
    return next(new ApiError("Please verify your email to login", 401));
  }

  const token = createToken(user._id);

  delete user._doc.password;
  delete user._doc.emailVerificationCode;

  res.status(200).json({ data: user, token });
});
