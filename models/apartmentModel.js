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
    city: {
      type: String,
      required: [true, "City is required"],
    },
    district: {
      type: String,
      required: [true, "District is required"],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Apartment must belong to a category"],
    },
    property_type: {
      type: String,
      required: [true, "Property type is required"],
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
    images: {
      type: [String],
      required: [true, "At least one image is required"],
    },
    status: {
      type: String,
      enum: ["available", "rented", "sold"],
      default: "available",
    },
    interestedUsers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
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
        let lng = ret.location.coordinates[0];
        let lat = ret.location.coordinates[1];

        delete ret.location.coordinates;
        ret.location.lng = lng;
        ret.location.lat = lat;
        return ret;
      },
    },
  }
);

apartmentSchema.index({ location: "2dsphere" });

const setImageURL = (doc) => {
  if (doc.images) {
    const imageUrl = `${process.env.BASE_URL}/apartments/${doc.image}`;
    doc.images = imageUrl;
  }
};
apartmentSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
apartmentSchema.post("save", (doc) => {
  setImageURL(doc);
});
module.exports = mongoose.model("Apartment", apartmentSchema);
