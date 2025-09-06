require("dotenv").config({ path: "config.env" });
const mongoose = require("mongoose");
const Apartment = require("./models/apartmentModel"); // adjust path

// MongoDB URI
const uri = `${process.env.DB_URL}`;

// List of images to shuffle
const imagesPool = [
  "68bc4b6dc6ac7c75b9b852e9",
  "68bc4b6ac6ac7c75b9b852e2",
  "68bc4b67c6ac7c75b9b852db",
  "68bc4b64c6ac7c75b9b852d4",
  "68bc4b62c6ac7c75b9b852cd",
  "68bc4b5ec6ac7c75b9b852c6"
];

// Random Arabic titles
const titles = [
  "شقة فاخرة في دمشق",
  "منزل واسع في حلب",
  "شقة عائلية في حمص",
  "فيلا مطلة على البحر في طرطوس",
  "شقة حديثة في اللاذقية",
  "بيت جميل في حماة",
  "شقة مميزة في إدلب",
  "منزل تقليدي في درعا",
  "شقة للبيع في السويداء",
  "بيت كبير في الحسكة",
];

// Syrian neighborhoods / cities
const neighborhoods = [
  "المزة",
  "البرامكة",
  "الصالحية",
  "باب توما",
  "جرمانا",
  "الحمدانية",
  "الأشرفية",
  "الغوطة",
  "القرداحة",
  "صافيتا",
  "دوما",
  "خان شيخون",
];

// Random helper
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    for (let i = 0; i < 20; i++) {
      const title = "-------" + (i + 1).toString();
      const slug = title.replace(/\s+/g, "-");
      const price = Math.floor(Math.random() * (200000 - 20000) + 20000);
      const size = Math.floor(Math.random() * (500 - 60) + 60);
      const rooms = Math.floor(Math.random() * 6) + 1;
      const bathrooms = Math.floor(Math.random() * 3) + 1;
      const floor = Math.floor(Math.random() * 10) + 1;
      const age = Math.floor(Math.random() * 50) + 1;

      // Shuffle images and pick 3
      const images = shuffle([...imagesPool]).slice(0, 3);

      const exampleApartment = new Apartment({
        title,
        slug,
        description: "عقار معروض للبيع في موقع مميز داخل سوريا.",
        price,
        neighborhood: getRandomItem(neighborhoods),
        city: "68bbf9bb0da88852eff33b09", // fixed city
        category: "buy",
        sellers: new mongoose.Types.ObjectId(), // placeholder seller
        property_type: "apartment",
        property_deed_type: "green",
        property_size: size,
        room: rooms,
        bathrooms,
        property_age: age,
        floor,
        stock: Math.floor(Math.random() * 3000) + 500,
        postStatus: "approved",
        images,
        status: "available",
        isFavorite: false,
        location: {
          type: "Point",
          coordinates: [
            35 + Math.random() * 5, // lng (rough Syria range)
            32 + Math.random() * 4, // lat
          ],
        },
      });

      const savedApartment = await exampleApartment.save();
      console.log(`🏠 Apartment saved: ${savedApartment._id}`);
    }

    mongoose.connection.close();
    console.log("🔒 Connection closed");
  } catch (err) {
    console.error("❌ Error:", err);
    mongoose.connection.close();
  }
}

run();
