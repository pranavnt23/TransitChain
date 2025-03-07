import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RouteSelection.css";

const RouteSelection = () => {
  const [currentLocation, setCurrentLocation] = useState("Fetching location...");
  const [source, setSource] = useState("Detecting...");
  const [destination, setDestination] = useState("");
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const routes = [
      { from: "Tirupur New Bus Stand", to: "Anai Pudur" },
      { from: "Anai Pudur", to: "Tirupur New Bus Stand" },
      { from: "Tirupur New Bus Stand", to: "Avinashi Bus Stand" },
      { from: "Avinashi Bus Stand", to: "Tirupur New Bus Stand" },
      { from: "Tirupur New Bus Stand", to: "Avinashi Temple" }
    ];
    const uniqueLocations = [...new Set(routes.flatMap(route => [route.from, route.to]))];
    setLocations(uniqueLocations);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`Lat: ${latitude}, Lng: ${longitude}`);
          // Here, you could implement logic to determine the nearest bus stand
          // For now, let's assume "Tirupur New Bus Stand" as the default source
          setSource("Tirupur New Bus Stand");
        },
        () => {
          setCurrentLocation("Location access denied");
          setSource("Unknown Location");
        }
      );
    } else {
      setCurrentLocation("Geolocation not supported");
      setSource("Unknown Location");
    }
  }, []);

  const handleProceed = () => {
    if (!destination) {
      alert("Please select a destination");
      return;
    }
    navigate("/payment", { state: { source, destination } });
  };

  return (
    <div className="route-selection-container">
      <h2>Select Your Route</h2>
      <div className="input-group">
        <label>Current Location</label>
        <input type="text" value={currentLocation} readOnly />
      </div>
      <div className="input-group">
        <label>Source</label>
        <input type="text" value={source} readOnly />
      </div>
      <div className="input-group">
        <label>Destination</label>
        <select 
          value={destination} 
          onChange={(e) => setDestination(e.target.value)}
        >
          <option value="">Select Destination</option>
          {locations.map((location, index) => (
            location !== source && (
              <option key={index} value={location}>{location}</option>
            )
          ))}
        </select>
      </div>
      <button className="submit-btn" onClick={handleProceed}>Proceed</button>
      <button className="back-btn" onClick={() => navigate("/")}>Back</button>
    </div>
  );
};

export default RouteSelection;