const mongoose = require("mongoose");

const helpUserSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    videoUrl: {
      type: String,
      required: false,
      match: [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
        "Please enter a valid YouTube URL",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpUser", helpUserSchema);
