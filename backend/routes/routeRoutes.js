// routes/routeRoutes.js
const express = require("express");
const router = express.Router();
const Route = require("../models/Route");

// Helper function to calculate Haversine distance
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLng = toRad(coords2.lng - coords1.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coords1.lat)) *
      Math.cos(toRad(coords2.lat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Get nearest source based on user's coordinates
router.post("/nearest-source", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: "Coordinates required" });

    const routes = await Route.find({});
    if (!routes.length) return res.status(404).json({ error: "No routes available" });

    let nearest = null;
    let minDistance = Infinity;

    routes.forEach((route) => {
      const distance = haversineDistance({ lat, lng }, route.fromCoords);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = route;
      }
    });

    res.json({
      nearestSource: nearest.from,
      order: nearest.order,
      distance: minDistance.toFixed(2) + " km",
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Get ordered bus stops
router.get("/ordered-stops", async (req, res) => {
  try {
    const stops = await Route.find({}).sort({ order: 1 });
    res.json(stops);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stops" });
  }
});

module.exports = router;
