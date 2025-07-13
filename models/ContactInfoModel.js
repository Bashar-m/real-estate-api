const mongoose = require("mongoose");

const ContactInfoSchema = new mongoose.Schema(
  {
    phoneNumbers: [
      {
        type: {
          type: String,
          enum: ["call", "whatsapp", "telegram"],
          required: true,
        },
        number: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInfo", ContactInfoSchema);
