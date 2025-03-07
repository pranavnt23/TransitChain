// Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import bgImage from "./assets/bg2.webp";
import Modal from "./Modal";

const Homepage = () => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false); // Added loading state
  const [error, setError] = useState(null); // Added error state
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e, formType) => {
    const { name, value } = e.target;
    // Clear any previous errors
    setError(null);
    
    if (formType === "login") {
      setLoginData({ ...loginData, [name]: value });
    } else {
      setRegisterData({ ...registerData, [name]: value });
    }
  };

  // Toggle between login and register modals
  const switchToRegister = () => {
    setLoginOpen(false);
    setError(null); // Clear errors when switching forms
    setTimeout(() => setRegisterOpen(true), 300);
  };

  const switchToLogin = () => {
    setRegisterOpen(false);
    setError(null); // Clear errors when switching forms
    setTimeout(() => setLoginOpen(true), 300);
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Store user info in localStorage or context
        localStorage.setItem('user', JSON.stringify(result.user));
        setLoginOpen(false);
        navigate("/route-selection");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      setError("Error connecting to server. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setRegisterOpen(false);
        // Show success and switch to login
        alert(`Registration successful! `);
        switchToLogin();
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (error) {
      setError("Error connecting to server. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <button className="cta-button" onClick={() => setLoginOpen(true)}>
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
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <input 
            name="username" 
            type="text" 
            placeholder="Username" 
            value={loginData.username} 
            onChange={(e) => handleChange(e, "login")} 
            required 
            disabled={loading}
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={loginData.password} 
            onChange={(e) => handleChange(e, "login")} 
            required 
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="switch-text">
          Don't have an account? <span className="switch-link" onClick={switchToRegister}>Create one</span>
        </p>
      </Modal>

      {/* Register Modal */}
      <Modal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)}>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister}>
          <input 
            name="username" 
            type="text" 
            placeholder="Username" 
            value={registerData.username} 
            onChange={(e) => handleChange(e, "register")} 
            required 
            disabled={loading}
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={registerData.email} 
            onChange={(e) => handleChange(e, "register")} 
            required 
            disabled={loading}
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={registerData.password} 
            onChange={(e) => handleChange(e, "register")} 
            required 
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="switch-text">
          Already have an account? <span className="switch-link" onClick={switchToLogin}>Login</span>
        </p>
      </Modal>
    </div>
  );
};

export default Homepage;