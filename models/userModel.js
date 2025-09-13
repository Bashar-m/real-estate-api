const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    phoneCountryCode: {
      type: String, // مثال: +963 أو +966
      required: true,
    },
    profileImg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: false,
    },
    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,

    // حقول إعادة تعيين كلمة المرور (Password Reset)
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    passwordResetLockedUntil: Date,
    passwordResetRequestCount: {
      type: Number,
      default: 0,
    },
    passwordResetLastSentAt: Date,
    passwordResetNextAllowedAt: Date,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    myApartment: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Apartment",
      },
    ],
    // حقول التحقق من البريد الإلكتروني (Email Verification)
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    emailVerificationAttempts: {
      type: Number,
      default: 0,
    },
    emailVerificationLockedUntil: Date,
    emailVerificationPenaltyLevel: {
      type: Number,
      default: 0,
    },

    // حقول إدارة طلبات OTP وتأخيرها (لتحقق البريد مثلاً)
    otpRequestCount: {
      type: Number,
      default: 0,
    },
    otpLastSentAt: Date,
    otpNextAllowedAt: Date,

    // تفاصيل الاشتراك
    apartmentCount: {
      type: Number,
      default: 0,
    },
    lastResetAt: {
      type: Date,
      default: Date.now,
    },
    isSubscriber: {
      type: Boolean,
      default: false,
    },

    // اختياري: تخزين توقيت المستخدم المحلي
    timezone: {
      type: String,
      default: "UTC",
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.virtual("imageUrl").get(function () {
  if (this.profileImg) {
    return `${process.env.BASE_URL}/users/${this.profileImg}`;
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
