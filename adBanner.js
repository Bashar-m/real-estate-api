require("dotenv").config({ path: "config.env" });
const mongoose = require("mongoose");
const Banner = require("./models/appBannerModel"); // adjust path

// Build the connection URI from .env
const uri = process.env.DB_URL;

async function seedBanners() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    // Clear old banners (optional)
    await Banner.deleteMany();

    // Insert new banners
    await Banner.insertMany([
      {
        image: new mongoose.Types.ObjectId("68bc4b6dc6ac7c75b9b852e9"),
        value: "Banner 1",
      },
      {
        image: new mongoose.Types.ObjectId("68bc4b6ac6ac7c75b9b852e2"),
        value: "Banner 2",
      },
      {
        image: new mongoose.Types.ObjectId("68bc4b67c6ac7c75b9b852db"),
        value: "Banner 3",
      },
    ]);

    console.log("🌱 Banners seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedBanners();
