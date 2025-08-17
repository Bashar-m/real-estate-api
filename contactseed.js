require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');
const ContactInfo = require('./models/ContactInfoModel'); // adjust path

const uri = `${process.env.DB_URL}`;

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const contacts = [
      { type: 'call', value: '+123456789', title: 'Main Phone' },
      { type: 'whatsapp', value: '+123456789', title: 'WhatsApp' },
      { type: 'telegram', value: '@ModernApartment', title: 'Telegram' },
      { type: 'facebook', value: 'https://facebook.com/modernapartment', title: 'Facebook' },
      { type: 'instagram', value: 'https://instagram.com/modernapartment', title: 'Instagram' },
    ];

    const savedContacts = await ContactInfo.insertMany(contacts);
    console.log('✅ Contacts saved:', savedContacts);

    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.connection.close();
  }
}

run();
