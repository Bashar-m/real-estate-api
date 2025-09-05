require("dotenv").config({ path: "config.env" });
const mongoose = require("mongoose");
const Apartment = require("./models/apartmentModel"); // adjust path

// Build the connection URI from .env
const uri = `${process.env.DB_URL}`;

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    for (let i = 0; i <= 55; i++) {
      const exampleApartment = new Apartment({
        title: "شقة حديثة للبيع في وسط المدينة",
        slug: "shaqa-haditha-lilbay-fi-wasat-al-madina",
        description: "شقه مميزه في موقع مميز تطل على جزر القمر",
        price: 70000,
        neighborhood: "Downtown",
        city: "688fb03eed1a2bd0f5b4e0be", // Replace with an existing City _id
        category: "buy",
        sellers: new mongoose.Types.ObjectId(), // Replace with an existing Sellers _id
        property_type: "apartment",
        property_deed_type: "green",
        property_size: 500,
        room: 7,
        bathrooms: 3,
        property_age: 55,
        floor: 4,
        stock: 2400,
        postStatus: "approved",
        images: [
          "68bb12e7a1f7729826cea856",
          "68bb12cda1f7729826cea847",
          "68acbaeba14e7b11b8c875cc",
        ],
        status: "available",
        isFavorite: false,
        location: {
          type: "Point",
          coordinates: [35.1408, 36.7553], // lng, lat
        },
      });

      const savedApartment = await exampleApartment.save();
      console.log("✅ Apartment saved:", savedApartment);
    }
    mongoose.connection.close();
    console.log("🔒 Connection closed");
  } catch (err) {
    console.error("❌ Error:", err);
    mongoose.connection.close();
  }
}

run();
