import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { source, destination } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showBankModal, setShowBankModal] = useState(false);
  
  // UPI state
  const [upiId, setUpiId] = useState("");
  const [userName, setUserName] = useState("");
  const [upiPin, setUpiPin] = useState("");
  const [emailConverted, setEmailConverted] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  // Card state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardVerified, setCardVerified] = useState(false);
  
  // Netbanking state
  const [selectedBank, setSelectedBank] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [bankStep, setBankStep] = useState(1);
  const [userVerified, setUserVerified] = useState(false);
  
  // Random fare amount
  const [fare, setFare] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    // Calculate a random fare between 20 and 50
    const calculatedFare = Math.floor(Math.random() * 31) + 20;
    setFare(calculatedFare);
    
    // Try to get logged in user info
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
  }, []);

  const handleUpiIdChange = (e) => {
    const inputUpiId = e.target.value;
    setUpiId(inputUpiId);
    setUserName("");
    setUpiVerified(false);
    
    // Clear any previous verification message
    setMessage({ text: "", type: "" });
  };
  
  const convertEmailToUpi = () => {
    if (upiId && upiId.includes('@')) {
      const [username, domain] = upiId.split('@');
      setUpiId(`${username}@okicici`);
      setEmailConverted(true);
    }
  };
  const verifyUpiId = async () => {
    if (!upiId) return;
    
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      const response = await fetch('http://localhost:5000/api/verify-upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ upiId })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUserName(data.username);
        setUpiVerified(true);
        setMessage({ text: `Welcome, ${data.username}!`, type: "success" });
      } else {
        setUserName("");
        setUpiVerified(false);
        setMessage({ text: data.message || 'Invalid UPI ID', type: "error" });
      }
    } catch (error) {
      console.error('UPI verification error:', error);
      setMessage({ text: "Error verifying UPI ID", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  
  
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
    // Reset verification status when card number changes
    setCardVerified(false);
    setMessage({ text: "", type: "" });
  };

  const handleCardNameChange = (e) => {
    setCardName(e.target.value);
    // Reset verification status when card name changes
    setCardVerified(false);
    setMessage({ text: "", type: "" });
  };

  const verifyCardDetails = async () => {
    // Only verify if we have all necessary card details
    if (!cardNumber || !cardName || !expiryMonth || !expiryYear) {
      setMessage({ text: "Please fill all card details", type: "error" });
      return;
    }
    
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      // Format card number - extract only last 4 digits
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      const last4Digits = cleanCardNumber.slice(-4);
      
      // Format expiry date correctly
      const expiry = `${expiryMonth}/${expiryYear}`;
      
      const response = await fetch('http://localhost:5000/api/verify-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          cardNumber: last4Digits, // Send only last 4 digits!
          cardName,
          expiry
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUserName(data.username);
        setCardVerified(true);
        setMessage({ text: `Card verified for ${data.username}!`, type: "success" });
      } else {
        // If card is not found, we'll still allow payment (to add as a new card)
        if (currentUser) {
          setCardVerified(true); // Consider it verified for new cards
          setMessage({ text: "New card will be saved to your account", type: "info" });
        } else {
          setMessage({ text: "Please login to save this card for future use", type: "info" });
        }
      }
    } catch (error) {
      console.error('Card verification error:', error);
      setMessage({ text: "Error verifying card details", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      let paymentData = {
        amount: fare,
        source,
        destination,
      };
      
      let endpoint = '';
      let userNameToPass = '';
      
      if (paymentMethod === "upi") {
        if (!upiVerified) {
          setMessage({ text: "Please verify your UPI ID first", type: "error" });
          setLoading(false);
          return;
        }
        
        endpoint = 'http://localhost:5000/api/payment/upi';
        paymentData = {
          ...paymentData,
          upiId,
          upiPin,
        };
        userNameToPass = userName; // This is the userName from UPI verification
      } else if (paymentMethod === "card") {
        // Basic validation for card details
        if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
          setMessage({ text: "Please fill all card details", type: "error" });
          setLoading(false);
          return;
        }
        
        if (cvv.length !== 3) {
          setMessage({ text: "CVV must be 3 digits", type: "error" });
          setLoading(false);
          return;
        }
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        const last4Digits = cleanCardNumber.slice(-4);
        const expiry = `${expiryMonth}/${expiryYear}`;

        endpoint = 'http://localhost:5000/api/payment/card';
        paymentData = {
          ...paymentData,
          username: currentUser?.username, // Include username if logged in
          cardDetails: {
            cardNumber: last4Digits,
            cardName,
            expiry,
            cvv,
          }
        };
        userNameToPass = cardName; // Use the name on the card
    }

       else if (paymentMethod === "netbanking") {
        endpoint = 'http://localhost:5000/api/payment/netbanking';
        paymentData = {
          ...paymentData,
          method: "netbanking",
          bank: selectedBank,
        };
        userNameToPass = currentUser?.username;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({
          text: "Payment successful! Redirecting to confirmation...",
          type: "success"
        });
        
        setTimeout(() => {
          navigate("/payment-success", { 
            state: { 
              source, 
              destination, 
              fare, 
              paymentMethod,
              transactionId: data.transactionId,
              newBalance: data.newBalance,
              userName: userNameToPass // Pass the user's name to PaymentSuccess
            } 
          });
        }, 2000);
      } else {
        setMessage({
          text: data.message || "Payment failed. Please check your details and try again.",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage({
        text: "An error occurred. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleNetbankingProceed = () => {
    setShowBankModal(true);
  };
  
  const handleBankLogin = async (e) => {
    e.preventDefault();
    
    if (!userId || !password) {
      setMessage({
        text: "Please enter valid credentials",
        type: "error"
      });
      return;
    }
    
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      // Verify user credentials
      const response = await fetch('http://localhost:5000/api/verify-netbanking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: userId,
          password
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUserName(data.username);
        setUserVerified(true);
        setBankStep(2);
      } else {
        setMessage({
          text: data.message || "Invalid credentials. Please try again.",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Bank login error:', error);
      setMessage({
        text: "An error occurred. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBankTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!transactionPin || transactionPin.length !== 4) {
      setMessage({
        text: "Please enter a valid 4-digit transaction PIN",
        type: "error"
      });
      setLoading(false);
      return;
    }
    
    try {
      const endpoint = 'http://localhost:5000/api/payment/netbanking';
      const paymentData = {
        email: userId,
        amount: fare,
        bank: selectedBank,
        source,
        destination,
        transactionPin
      };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({
          text: "Transaction successful! Redirecting to confirmation...",
          type: "success"
        });
        
        setTimeout(() => {
          setShowBankModal(false);
          navigate("/payment-success", { 
            state: { 
              source, 
              destination, 
              fare, 
              paymentMethod: "netbanking",
              transactionId: data.transactionId,
              newBalance: data.newBalance,
              userName: userName // Pass the verified username
            } 
          });
        }, 2000);
      } else {
        setMessage({
          text: data.message || "Invalid transaction PIN. Please try again.",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Netbanking payment error:', error);
      setMessage({
        text: "An error occurred. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to format card number for display
  const formatCardNumberForDisplay = (number) => {
    if (!number) return "•••• •••• •••• ••••";
    
    // Ensure we only display what's entered and fill the rest with dots
    const parts = number.split(' ');
    const formattedParts = [];
    
    for (let i = 0; i < 4; i++) {
      if (parts[i]) {
        formattedParts.push(parts[i]);
      } else {
        formattedParts.push("••••");
      }
    }
    
    return formattedParts.join(' ');
  };
  
  const renderPaymentForm = () => {
    switch (paymentMethod) {
        case "upi":
            return (
              <div className="payment-form upi-form">
                <div className="input-group">
                  <label>Email ID / UPI ID</label>
                  <div className="input-with-action">
                    <input
                      type="text"
                      placeholder="email@domain.com or username@upi"
                      value={upiId}
                      onChange={handleUpiIdChange}
                      disabled={emailConverted || upiVerified}
                      required
                    />
                    
                    {!upiVerified && upiId && (
                      <button type="button" className="action-btn" onClick={verifyUpiId}>
                        Verify UPI
                      </button>
                    )}
                  </div>
                </div>
                
                {userName && (
                  <div className="user-info animate-fade-in">
                    <p><strong>Name:</strong> {userName}</p>
                    <div className="input-group">
                      <label>UPI PIN</label>
                      <input
                        type="password"
                        placeholder="Enter 4-digit PIN"
                        maxLength="4"
                        value={upiPin}
                        onChange={(e) => setUpiPin(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            );
            
      case "card":
        return (
          <div className="payment-form card-form">
            <div className="card-container">
              <div className={`credit-card ${cardNumber ? 'has-value' : ''}`}>
                <div className="card-front">
                  <div className="card-logo">VISA</div>
                  <div className="card-number">
                    {formatCardNumberForDisplay(cardNumber)}
                  </div>
                  <div className="card-info">
                    <div className="card-holder">
                      <label>Card Holder</label>
                      <div>{cardName || "YOUR NAME"}</div>
                    </div>
                    <div className="card-expiry">
                      <label>Expires</label>
                      <div>{expiryMonth || "MM"}/{expiryYear || "YY"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="input-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                required
              />
            </div>
            
            <div className="input-group">
              <label>Name on Card</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="input-group">
                <label>Expiry Date</label>
                <div className="expiry-inputs">
                  <select 
                    value={expiryMonth} 
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    required
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      return (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      );
                    })}
                  </select>
                  <span>/</span>
                  <select 
                    value={expiryYear} 
                    onChange={(e) => setExpiryYear(e.target.value)}
                    required
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year.toString().slice(-2)}>
                          {year.toString().slice(-2)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div className="input-group">
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="Enter your CVV"
                  maxLength="3"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        );
        
      case "netbanking":
        return (
          <div className="payment-form netbanking-form">
            <div className="input-group">
              <label>Select Bank</label>
              <select 
                value={selectedBank} 
                onChange={(e) => setSelectedBank(e.target.value)}
                required
              >
                <option value="">Choose your bank</option>
                <option value="globalbank">Global Bank</option>
              </select>
            </div>
            
            {selectedBank && (
              <button 
                type="button" 
                className="proceed-bank-btn"
                onClick={handleNetbankingProceed}
              >
                Proceed to Bank Login
              </button>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Your Payment</h1>
        
        <div className="journey-details">
          <div className="detail">
            <span className="label">From:</span>
            <span className="value">{source || "Starting Point"}</span>
          </div>
          <div className="separator">
            <div className="dot"></div>
            <div className="line"></div>
            <div className="dot"></div>
          </div>
          <div className="detail">
            <span className="label">To:</span>
            <span className="value">{destination || "Destination"}</span>
          </div>
          <div className="fare">
            <span className="label">Fare:</span>
            <span className="value price">₹{fare.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="payment-methods">
          <div 
            className={`method ${paymentMethod === "upi" ? "active" : ""}`}
            onClick={() => setPaymentMethod("upi")}
          >
            <div className="method-icon">
              <i className="upi-icon">UPI</i>
            </div>
            <div className="method-name">UPI Payment</div>
          </div>
          
          <div 
            className={`method ${paymentMethod === "card" ? "active" : ""}`}
            onClick={() => setPaymentMethod("card")}
          >
            <div className="method-icon">
              <i className="card-icon">Card</i>
            </div>
            <div className="method-name">Credit/Debit Card</div>
          </div>
          
          <div 
            className={`method ${paymentMethod === "netbanking" ? "active" : ""}`}
            onClick={() => setPaymentMethod("netbanking")}
          >
            <div className="method-icon">
              <i className="netbanking-icon">Bank</i>
            </div>
            <div className="method-name">Net Banking</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {renderPaymentForm()}
          
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          {paymentMethod !== "netbanking" && (
            <button 
              type="submit" 
              className={`pay-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loader"></span>
              ) : (
                `Pay ₹${fare.toFixed(2)}`
              )}
            </button>
          )}
        </form>
        
        <button className="back-button" onClick={() => navigate("/route-selection")}>
          Back to Route Selection
        </button>
      </div>
      
      {/* Bank Modal */}
      {showBankModal && (
        <div className="bank-modal-overlay">
          <div className="bank-modal">
            <div className="bank-modal-header">
              <h2>Global Bank</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowBankModal(false);
                  setBankStep(1);
                  setUserVerified(false);
                }}
              >
                &times;
              </button>
            </div>
            
            <div className="bank-modal-content">
              {bankStep === 1 ? (
                <form onSubmit={handleBankLogin}>
                  <div className="bank-logo">
                    <div className="bank-icon">GB</div>
                    <h3>Global Bank Login</h3>
                  </div>
                  
                  <div className="input-group">
                    <label>User ID (Email)</label>
                    <input
                      type="text"
                      placeholder="Enter your email"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {message.text && (
                    <div className={`message ${message.type}`}>
                      {message.text}
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="bank-login-btn"
                    disabled={loading}
                  >
                    {loading ? <span className="loader"></span> : "Login"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBankTransaction}>
                  <div className="transaction-details">
                    <h3>Transaction Details</h3>
                    <div className="transaction-info">
                      <p><strong>Welcome,</strong> {userName}</p>
                      <p><strong>From Account:</strong> XXXX1234</p>
                      <p><strong>Amount:</strong> ₹{fare.toFixed(2)}</p>
                      <p><strong>Payee:</strong> TransitChain</p>
                      <p><strong>Description:</strong> Bus Fare Payment</p>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label>Transaction PIN</label>
                    <input
                      type="password"
                      placeholder="Enter 4-digit PIN"
                      maxLength="4"
                      value={transactionPin}
                      onChange={(e) => setTransactionPin(e.target.value)}
                      required
                    />
                  </div>
                  
                  {message.text && (
                    <div className={`message ${message.type}`}>
                      {message.text}
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className={`confirm-payment-btn ${loading ? "loading" : ""}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loader"></span>
                    ) : (
                      "Confirm Payment"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;