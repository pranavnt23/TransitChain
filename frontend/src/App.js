import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Home";
import RouteSelection from "./RouteSelection";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/route-selection" element={<RouteSelection />} />
      </Routes>
    </Router>
  );
};

export default App;