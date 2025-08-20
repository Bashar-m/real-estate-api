const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// const setImageURL = (doc) => {
//   if (Array.isArray(doc.path)) {
//     doc.path = doc.path.map((img) => `apartments/${img}`);
//   }
// };

// imageSchema.post("init", (doc) => {
//   setImageURL(doc);
// });

// // create
// imageSchema.post("save", (doc) => {
//   setImageURL(doc);
// });

// Virtual لإرجاع رابط الصورة كامل
imageSchema.virtual("url").get(function () {
  return this.path ? `/uploads/${this.path}` : null;
});

module.exports = mongoose.model("Image", imageSchema);
