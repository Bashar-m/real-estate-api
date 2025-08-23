const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: false,
    },
    value: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// هذه الخاصية الافتراضية تنشئ رابط الصورة كاملاً
// ولكن لا تحفظه في قاعدة البيانات
bannerSchema.virtual("imageUrl").get(function () {
  if (this.image) {
    return `${process.env.BASE_URL}/banner/${this.image}`;
  }
});

module.exports = mongoose.model("Banner", bannerSchema);
