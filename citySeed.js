require("dotenv").config({ path: "config.env" });
const mongoose = require("mongoose");
const city = require("./models/cityModle");


// Build the connection URI from .env
const uri = `${process.env.DB_URL}`;

async function seedCities() {
  try {
    // connect
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    // clear existing cities (optional)
    await city.deleteMany();

    // insert new ones
    await city.insertMany([
      { name: "Hama" },
      { name: "Homs" },
    ]);

    console.log("🌱 Cities seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedCities();
