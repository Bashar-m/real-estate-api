const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },
  },
  { timestamps: true }
);

//لعدم السماح بالتكرار لنفس الشقق لنفس المستخدم وهكذا
wishlistSchema.index({ user: 1, apartment: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
