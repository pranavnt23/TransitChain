// RouteSelection.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RouteSelection.css";

const RouteSelection = () => {
  const [source, setSource] = useState("Fetching location...");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user location automatically
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSource(`Lat: ${latitude}, Lng: ${longitude}`);
        },
        () => {
          setSource("Location access denied");
        }
      );
    } else {
      setSource("Geolocation not supported");
    }
  }, []);

  return (
    <div className="route-selection-container">
      <h2>Select Your Route</h2>
      <div className="input-group">
        <label>Source</label>
        <input type="text" value={source} readOnly />
      </div>
      <div className="input-group">
        <label>Destination</label>
        <input 
          type="text" 
          value={destination} 
          onChange={(e) => setDestination(e.target.value)} 
          placeholder="Enter your destination" 
        />
      </div>
      <button className="submit-btn">Proceed</button>
      <button className="back-btn" onClick={() => navigate("/")}>Back</button>
    </div>
  );
};

export default RouteSelection;
