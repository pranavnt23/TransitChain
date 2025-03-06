require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const connectDB = require('./config/db'); // Connect to MongoDB

// Bus Route Schema
const busRouteSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  fare: { type: Number, required: true },
  fromCoords: { lat: Number, lng: Number },
  toCoords: { lat: Number, lng: Number },
});

const BusRoute = mongoose.model('bus1_route', busRouteSchema);

// Connect to MongoDB
connectDB();

// Locations and Coordinates Data
const locations = [
  { name: 'Tirupur New Bus Stand', lat: 11.1085, lng: 77.3411 },
  { name: 'Railway Station (Tirupur)', lat: 11.1059, lng: 77.3275 },
  { name: 'Pushpa Theatre', lat: 11.1072, lng: 77.3304 },
  { name: 'Kumar Nagar', lat: 11.1180, lng: 77.3419 },
  { name: 'SAP Theatre', lat: 11.1205, lng: 77.3453 },
  { name: 'Gandhi Nagar (Tirupur)', lat: 11.1257, lng: 77.3482 },
  { name: 'Periyaar Colony', lat: 11.1308, lng: 77.3505 },
  { name: 'Anuppar Palayam', lat: 11.1345, lng: 77.3551 },
  { name: 'Thanner Pandhal (Tirupur)', lat: 11.1402, lng: 77.3609 },
  { name: 'Amma Palayam', lat: 11.1450, lng: 77.3657 },
  { name: 'Tirumurugan Poondi', lat: 11.1554, lng: 77.3722 },
  { name: 'Anai Pudur', lat: 11.1601, lng: 77.3785 },
  { name: 'Avinashi Bus Stand', lat: 11.1670, lng: 77.3841 },
  { name: 'Avinashi Temple', lat: 11.1728, lng: 77.3896 },
  { name: 'Aatayam Palayam', lat: 11.1785, lng: 77.3945 },
  { name: 'Tekkalur', lat: 11.1834, lng: 77.4002 },
  { name: 'Tamil Nadu Engg. College', lat: 11.1901, lng: 77.4071 },
  { name: 'Karumathampatti', lat: 11.2004, lng: 77.4150 },
  { name: 'Chiniyampalayam', lat: 11.2109, lng: 77.4237 },
  { name: 'Kaniyur Toll Booth', lat: 11.2205, lng: 77.4321 },
  { name: 'R G pudur', lat: 11.2254, lng: 77.4378 },
  { name: 'Thennam Palayam', lat: 11.2301, lng: 77.4440 },
  { name: 'Thottipalayam pirivu', lat: 11.2350, lng: 77.4502 },
  { name: 'Sulur Privu', lat: 11.2402, lng: 77.4555 },
  { name: 'Gold Wins', lat: 11.2455, lng: 77.4609 },
  { name: 'Neelambur', lat: 11.2505, lng: 77.4657 },
  { name: 'SITRA', lat: 11.2550, lng: 77.4705 },
  { name: 'SITRA (Mahendra Pumps)', lat: 11.2582, lng: 77.4731 },
  { name: 'Mahendra Pumps', lat: 11.2605, lng: 77.4755 },
  { name: 'Nehru Nagar-I', lat: 11.2650, lng: 77.4805 },
];

// Generate fares with coordinates
const generateFares = (locations) => {
  const fares = [];
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const fare = 5 + (j - i) * 2; // Base fare logic: increase by 2 per stop
      fares.push({
        from: locations[i].name,
        to: locations[j].name,
        fare,
        fromCoords: { lat: locations[i].lat, lng: locations[i].lng },
        toCoords: { lat: locations[j].lat, lng: locations[j].lng },
      });
      fares.push({
        from: locations[j].name,
        to: locations[i].name,
        fare,
        fromCoords: { lat: locations[j].lat, lng: locations[j].lng },
        toCoords: { lat: locations[i].lat, lng: locations[i].lng },
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