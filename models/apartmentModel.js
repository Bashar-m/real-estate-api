const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [3, "Title is too short"],
      maxlength: [100, "Title is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description is too short"],
      maxlength: [2000, "Description is too long"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    neighborhood: {
      type: String,
    },
    city: {
      type: mongoose.Schema.ObjectId,
      ref: "City",
      required: [true, "City is required"],
    },
    //remove
    // district: {
    //   type: String,
    //   required: [true, "District is required"],
    // },

    //bye and rent
    category: {
      type: String,
      enum: ["buy", "rent"],
      required: [true, "Apartment must belong to a category"],
    },
    sellers: {
      type: mongoose.Schema.ObjectId,
      ref: "Sellers",
      required: [true, "Sellers info is required"],
    },

    //enum
    property_type: {
      type: String,
      enum: [
        "apartment",
        "villa",
        "land",
        "agricultural-Land",
        "industrial-Land",
        "farm",
        "shop",
        "architecture",
      ],
      required: [true, "Property type is required"],
    },
    property_deed_type: {
      type: String,
      required: true,
      enum: [
        "green",
        "courtRolling",
        "municipal",
        "farm",
        "industrial",
        "aqricvltural",
      ],
    },
    property_size: {
      type: Number,
      required: [true, "Property size is required"],
    },
    room: {
      type: Number,
      required: [true, "Number of rooms is required"],
    },
    bathrooms: {
      type: Number,
    },
    property_age: {
      type: Number,
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["available", "rented", "sold"],
      default: "available",
    },
    //من   نشر الشقه
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: false,
    },
    // مراجعه الشقه قبل     النشر
    postStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isFavorite: {
      type: Boolean,
    },

    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        required: [true, "Coordinates are required"],
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        let lng = ret.location.coordinates[1];
        let lat = ret.location.coordinates[0];

        delete ret.location.coordinates;
        ret.location.lng = lng;
        ret.location.lat = lat;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        let lng = ret.location.coordinates[1];
        let lat = ret.location.coordinates[0];

        delete ret.location.coordinates;
        ret.location.lng = lng;
        ret.location.lat = lat;
        return ret;
      },
    },
  }
);

apartmentSchema.index({ location: "2dsphere" });

// const setImageURL = (doc) => {
//   if (Array.isArray(doc.images)) {
//     doc.images = doc.images.map((img) => `apartments/${img}`);
//   }
// };

// apartmentSchema.post("init", (doc) => {
//   setImageURL(doc);
// });

// // create
// apartmentSchema.post("save", (doc) => {
//   setImageURL(doc);
// });
module.exports = mongoose.model("Apartment", apartmentSchema);
//نوع العقار و الفئه فلتره
