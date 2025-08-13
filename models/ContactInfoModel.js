const mongoose = require("mongoose");

const ContactInfoSchema = new mongoose.Schema(
  {
    
      
        type: {
          type: String,
          enum: ["call", "whatsapp", "telegram","facebook","instagram"],
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
        title:{
          type:String,
          required: false,
        },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInfo", ContactInfoSchema);
