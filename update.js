require("dotenv").config({ path: "config.env" });
const mongoose = require("mongoose");
const Apartment = require("./models/apartmentModel"); // تأكد من المسار الصحيح

const uri = `${process.env.DB_URL}`;

// مجموعة أسماء عشوائية للشقق
const titles = [
  "شقة فاخرة بإطلالة رائعة",
  "منزل عائلي واسع في حي هادئ",
  "شقة للبيع قرب الخدمات",
  "عقار استثماري في قلب المدينة",
  "فرصة لا تعوّض للسكن الراقي",
  "شقة بإطلالة بحرية",
  "منزل حديث البناء",
  "شقة مميزة بسعر مناسب",
];

// دالة توليد إحداثيات عشوائية داخل سوريا
function getRandomCoordinatesInSyria() {
  const latMin = 32.0;
  const latMax = 37.5;
  const lngMin = 35.5;
  const lngMax = 42.0;

  const lat = Math.random() * (latMax - latMin) + latMin;
  const lng = Math.random() * (lngMax - lngMin) + lngMin;

  return [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))]; // [lng, lat]
}

async function updateApartments() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const apartments = await Apartment.find();

    for (let apt of apartments) {
      const newTitle = titles[Math.floor(Math.random() * titles.length)];
      const newSlug = newTitle
        .replace(/ /g, "-")
        .replace(/[^\u0600-\u06FF\w-]/g, "")
        .toLowerCase();

      const coordinates = getRandomCoordinatesInSyria();

      apt.title = newTitle;
      apt.slug = newSlug;
      apt.location = {
        type: "Point",
        coordinates: coordinates,
      };

      await apt.save();
      console.log(
        `✅ Updated apartment ${apt._id} with title "${newTitle}" and coordinates ${coordinates}`
      );
    }

    console.log("🔁 All apartments updated.");
    mongoose.connection.close();
    console.log("🔒 Connection closed");
  } catch (err) {
    console.error("❌ Error:", err);
    mongoose.connection.close();
  }
}

updateApartments();
