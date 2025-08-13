const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

// 📩 إرسال كود إعادة تعيين كلمة المرور عبر البريد
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("There is no user for this E-mail", 404));
  }

  // تحقق من الوقت المسموح به لكود إعادة تعيين كلمة المرور
  if (user.passwordResetNextAllowedAt && user.passwordResetNextAllowedAt > Date.now()) {
    return res.status(200).json({
      status: "failure",
      message: "You need to wait before requesting a new password reset code.",
      nextRequestAt: new Date(user.passwordResetNextAllowedAt).toISOString(),
    });
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(resetCode);
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 دقائق
  user.passwordResetVerified = false;
  user.passwordResetAttempts = 0;
  user.passwordResetLockedUntil = undefined;

  // جدول التأخير لإعادة تعيين كلمة المرور (10د، 15د، 30د، يوم كامل)
  const delaySchedule = [10, 15, 30, 1440];
  const currentCount = user.passwordResetRequestCount || 0;
  const delayIndex = currentCount % delaySchedule.length;
  const delayInMs = delaySchedule[delayIndex] * 60 * 1000;

  const nextAllowedTime = Date.now() + delayInMs;

  user.passwordResetRequestCount = currentCount + 1;
  user.passwordResetLastSentAt = Date.now();
  user.passwordResetNextAllowedAt = nextAllowedTime;

  try {
    await user.save();

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <div style="background-color: #ec5252; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Reset Your Password</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
            <p style="font-size: 15px;">
              You requested to reset your password. Use the code below to proceed:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #ec5252;">
                ${resetCode}
              </span>
            </div>
            <p style="font-size: 14px; color: #666;">
              This code will expire in <strong>10 minutes</strong>. If you didn’t request a password reset, you can safely ignore this email.
            </p>
            <p style="font-size: 14px; color: #999; margin-top: 40px;">
              — The Real Estate App Team
            </p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      html: htmlMessage,
    });

    res.status(200).json({
      status: "success",
      message: `Reset code sent to email: ${user.email}`,
      nextRequestAt: new Date(nextAllowedTime).toISOString(),
    });
  } catch (err) {
    // في حالة الخطأ قم بمسح بيانات إعادة التعيين فقط
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    user.passwordResetRequestCount = undefined;
    user.passwordResetLastSentAt = undefined;
    user.passwordResetNextAllowedAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ApiError("Error in sending reset code", 500));
  }
});


// ✅ التحقق من كود إعادة التعيين وتعيين كلمة المرور الجديدة
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const { email, resetCode, newPassword, confirmPassword } = req.body;

  if (!email || !resetCode || !newPassword || !confirmPassword) {
    return next(new ApiError("All fields are required", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new ApiError("Passwords do not match", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError("User not found with this email", 404));
  }

  if (
    user.passwordResetLockedUntil &&
    user.passwordResetLockedUntil > Date.now()
  ) {
    return next(
      new ApiError(
        `Too many attempts. Please try again after ${new Date(
          user.passwordResetLockedUntil
        ).toLocaleTimeString()}`,
        429
      )
    );
  }

  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  if (
    user.passwordResetCode !== hashedResetCode ||
    !user.passwordResetExpires ||
    user.passwordResetExpires < Date.now()
  ) {
    user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;

    if (user.passwordResetAttempts >= 5) {
      user.passwordResetLockedUntil = Date.now() + 15 * 60 * 1000; // 15 دقيقة
      await user.save();
      return next(
        new ApiError(
          `Too many attempts. Account locked until ${new Date(
            user.passwordResetLockedUntil
          ).toLocaleTimeString()}`,
          429
        )
      );
    }

    await user.save();
    return next(new ApiError("Reset Code invalid or expired", 400));
  }

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = true;
  user.passwordResetAttempts = 0;
  user.passwordResetLockedUntil = undefined;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully.",
  });
});
