// Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Home.css";
import bgImage from "./assets/bg2.webp";
import Modal from "./Modal";

const Homepage = () => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigation

  return (
    <div className="homepage-container">
      <header className="header">
        <div className="auth-buttons">
          <button className="login-btn" onClick={() => setLoginOpen(true)}>Login</button>
          <button className="register-btn" onClick={() => setRegisterOpen(true)}>Register</button>
        </div>
        <div className="logo">
          <h1>TransitChain</h1>
        </div>
      </header> 

      <main className="main-content">
        <div className="hero-section">
          <div className="hero-image-container">
            <img 
              src={bgImage} 
              alt="Decentralized transport payment system" 
              className="hero-image"
            />
          </div>
          <div className="hero-text">
            <h2>Revolutionizing Public Transport Payments</h2>
            <p>
              A unified, cross-border blockchain payment platform that eliminates the need for multiple 
              city-specific travel cards. Experience seamless, low-cost transactions with instant settlements 
              and complete privacy.
            </p>
            <button className="cta-button" onClick={() => navigate("/route-selection")}>
              Get Started Now
            </button>
          </div>
          
          <div className="features-container">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Privacy-preserving cryptography ensures your data stays yours</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Payments</h3>
              <p>Layer 2 scaling for immediate transaction settlements</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌎</div>
              <h3>Global Access</h3>
              <p>One solution for all your public transport needs worldwide</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 TransitChain - Revolutionizing Public Transport Payments</p>
      </footer>

      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)}>
        <h2>Login</h2>
        <form>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </Modal>

      {/* Register Modal */}
      <Modal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)}>
        <h2>Register</h2>
        <form>
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Register</button>
        </form>
      </Modal>
    </div>
  );
};

export default Homepage;
