const mongoose = require("mongoose");

const helpUserSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    helpCover: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: false,
    },
    videoUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

helpUserSchema.virtual("imageUrl").get(function () {
  if (this.helpCover) {
    return `${process.env.BASE_URL}/helpUser/${this.helpCover}`;
  }
});

module.exports = mongoose.model("HelpUser", helpUserSchema);
