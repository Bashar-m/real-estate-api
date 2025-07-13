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
    profileImg: {
      type: [String],
    },
    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    passwordResetLockedUntil: Date,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    // child reference (one to many)
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Apartment",
      },
    ],

    emailVerificationCode: String,
    emailVerificationExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,

    //هون مشان رجع الرد بدون ال __v
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

const setImageURL = (doc) => {
  if (doc.profileImg) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
    doc.image = imageUrl;
  }
};
userSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
userSchema.post("save", (doc) => {
  setImageURL(doc);
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
