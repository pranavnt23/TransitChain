// models/Route.js
const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  fare: { type: Number, required: true },
  fromCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  toCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  order: { type: Number, required: true }, // Bus stop order in the route
});

const BusRoute = mongoose.model("bus1_route", busRouteSchema);

module.exports = BusRoute;