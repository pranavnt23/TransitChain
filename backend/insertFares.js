// insertFares.js

require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const connectDB = require('./config/db'); // Connect to MongoDB

// Bus Route Schema
const busRouteSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  fare: { type: Number, required: true },
});

const BusRoute = mongoose.model('bus1_route', busRouteSchema);

// Connect to MongoDB
connectDB();

// Locations and Fares Data
const locations = [
  'Tirupur New Bus Stand', 'Railway Station (Tirupur)', 'Pushpa Theatre', 'Kumar Nagar',
  'SAP Theatre', 'Gandhi Nagar (Tirupur)', 'Periyaar Colony', 'Anuppar Palayam',
  'Thanner Pandhal (Tirupur)', 'Amma Palayam', 'Tirumurugan Poondi', 'Anai Pudur',
  'Avinashi Bus Stand', 'Avinashi Temple', 'Aatayam Palayam', 'Tekkalur',
  'Tamil Nadu Engg. College', 'Karumathampatti', 'Chiniyampalayam',
  'Kaniyur Toll Booth', 'R G pudur', 'Thennam Palayam', 'Thottipalayam pirivu',
  'Sulur Privu', 'Gold Wins', 'Neelambur', 'SITRA', 'SITRA (Mahendra Pumps)',
  'Mahendra Pumps', 'Nehru Nagar-I'
];

// Generate fares (dummy fares for demonstration)
const generateFares = (locations) => {
  const fares = [];
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const fare = 5 + (j - i) * 2; // Base fare logic: increase by 2 per stop
      fares.push({
        from: locations[i],
        to: locations[j],
        fare,
      });
      fares.push({
        from: locations[j],
        to: locations[i],
        fare,
      });
    }
  }
  return fares;
};

// Insert fares into MongoDB
const insertFares = async () => {
  try {
    const fareData = generateFares(locations);

    // Clear existing collection (optional)
    await BusRoute.deleteMany({});
    console.log('🗑️ Cleared existing bus1_route collection');

    // Insert new fares
    await BusRoute.insertMany(fareData);
    console.log(`✅ Successfully inserted ${fareData.length} fare records`);

    mongoose.connection.close(); // Close connection after insertion
  } catch (error) {
    console.error('❌ Error inserting fares:', error);
    mongoose.connection.close();
  }
};

insertFares();
