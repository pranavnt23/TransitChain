// RouteSelection.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const RouteSelection = () => {
  const [currentLocation, setCurrentLocation] = useState("Fetching location...");
  const [nearestSource, setNearestSource] = useState("Detecting...");
  const [stops, setStops] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation(`Lat: ${latitude}, Lng: ${longitude}`);
        try {
          const response = await axios.post(
            "http://localhost:5000/api/routes/nearest-source",
            { lat: latitude, lng: longitude }
          );
          setNearestSource(response.data.nearestSource);
        } catch (error) {
          setNearestSource("Unknown");
        }
      },
      () => {
        setCurrentLocation("Location access denied");
        setNearestSource("Unknown");
      }
    );

    const fetchStops = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/routes/ordered-stops"
        );
        setStops(data);
      } catch {
        setStops([]);
      }
    };

    fetchStops();
  }, []);

  return (
    <div>
      <h2>Route Selection</h2>
      <p>Current Location: {currentLocation}</p>
      <p>Nearest Source: {nearestSource}</p>

      <h3>Bus Stops (In Order):</h3>
      <ol>
        {stops.map((stop) => (
          <li key={stop._id}>
            {stop.from} → {stop.to} (₹{stop.fare})
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RouteSelection;
