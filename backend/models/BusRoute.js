const mongoose = require("mongoose");

const busRouteSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  fare: { type: Number, required: true },
});

const BusRoute = mongoose.model("bus1_route", busRouteSchema);

module.exports = BusRoute;