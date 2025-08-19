
require('dotenv').config({path: "config.env"});
const mongoose = require('mongoose');
const Apartment = require('./models/apartmentModel'); // adjust path

// Build the connection URI from .env
const uri = `${process.env.DB_URL}`;

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const exampleApartment = new Apartment({
      title: 'Modern 2-Bedroom Apartment',
      slug: 'modern-2-bedroom-apartment',
      description: 'A spacious modern apartment located in the heart of the city with easy access to transportation.',
      price: 250000,
      neighborhood: 'Downtown',
      city: new mongoose.Types.ObjectId("689d052b44ffa75ea3532471"), // Replace with an existing City _id
      category: 'buy',
      sellers: new mongoose.Types.ObjectId(), // Replace with an existing Sellers _id
      property_type: 'apartment',
      property_deed_type: 'green',
      property_size: 500,
      room: 7,
      bathrooms: 3,
      property_age: 55,
      images: ['apartment-a56af34e-4c98-410e-91ff-890656deca15-1751822627103-2.jpeg', 'apartment-a56af34e-4c98-410e-91ff-890656deca15-1751822627103-2.jpeg'],
      status: 'available',
      isFavorite: false,
      location: {
        type: 'Point',
        coordinates: [35.1408, 36.7553], // lng, lat
      },
    });

    const savedApartment = await exampleApartment.save();
    console.log('✅ Apartment saved:', savedApartment);

    mongoose.connection.close();
    console.log('🔒 Connection closed');
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.connection.close();
  }
}

run();
