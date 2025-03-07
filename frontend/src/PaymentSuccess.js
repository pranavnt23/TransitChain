import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { source, destination, fare, paymentMethod, transactionId, userName } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(true);
  const receiptRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Get current date and time for the receipt
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  // Format payment method for display
  const formatPaymentMethod = (method) => {
    switch(method) {
      case "upi": return "UPI Payment";
      case "card": return "Credit/Debit Card";
      case "netbanking": return "Net Banking";
      default: return "Online Payment";
    }
  };
  
  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    // Get the current user's information from localStorage if not provided in location state
    if (!userName) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        setCurrentUser(JSON.parse(userInfo));
      }
    }
    
    return () => clearTimeout(timer);
  }, [userName]);
  
  // Get user's name and initials
  const getUserName = () => {
    if (userName) return userName;
    if (currentUser && currentUser.username) return currentUser.username;
    return "User";
  };
  
  const getUserInitials = () => {
    const name = getUserName();
    if (name === "User") return "U";
    
    // Get initials from name (first letter of each word)
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };
  
  const handleDownloadPDF = () => {
    const receipt = receiptRef.current;
    
    html2canvas(receipt, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`TransitChain_Receipt_${transactionId}.pdf`);
    });
  };
  
  const handleShareScreenshot = () => {
    const receipt = receiptRef.current;
    
    html2canvas(receipt, { scale: 2 }).then((canvas) => {
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        // Create file from blob
        const file = new File([blob], `TransitChain_Receipt_${transactionId}.png`, { type: 'image/png' });
        
        // Check if Web Share API is available
        if (navigator.share) {
          navigator.share({
            files: [file],
            title: 'TransitChain Receipt',
            text: 'Here is my TransitChain receipt!'
          }).catch(error => {
            console.error('Error sharing:', error);
            // Fallback: download as image if sharing fails
            downloadScreenshot(canvas);
          });
        } else {
          // Fallback: download as image
          downloadScreenshot(canvas);
        }
      });
    });
  };
  
  const downloadScreenshot = (canvas) => {
    const link = document.createElement('a');
    link.download = `TransitChain_Receipt_${transactionId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  return (
    <div className="payment-success-container">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, index) => (
            <div
              key={index}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
            ></div>
          ))}
        </div>
      )}
      
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 13L10 16L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Payment Successful!</h1>
          <p className="subtitle">Your transaction has been completed successfully</p>
        </div>
        
        <div className="receipt-container" ref={receiptRef}>
          <div className="receipt-header">
            <div className="logo">TransitChain</div>
            <div className="receipt-title">Payment Receipt</div>
          </div>
          
          <div className="receipt-details">
            <div className="detail-item">
              <span className="detail-label">Transaction ID:</span>
              <span className="detail-value">{transactionId}</span>
            </div>
            
            <div className="transfer-details">
              <div className="from-to">
                <div className="from">
                  <span className="label">From</span>
                  <div className="circle">
                    <span className="initials">{getUserInitials()}</span>
                  </div>
                  <span className="name">{getUserName()}</span>
                </div>
                
                <div className="transfer-arrow">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                <div className="to">
                  <span className="label">To</span>
                  <div className="circle">
                    <span className="initials">TC</span>
                  </div>
                  <span className="name">TransitChain.in</span>
                </div>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Amount:</span>
              <span className="detail-value amount">₹{fare?.toFixed(2) || "0.00"}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{formatPaymentMethod(paymentMethod)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formattedDate}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{formattedTime}</span>
            </div>
            
            <div className="journey-details">
              <div className="journey-title">Journey Details</div>
              <div className="journey-path">
                <div className="location start">
                  <div className="dot"></div>
                  <div className="location-name">{source || "Starting Point"}</div>
                </div>
                <div className="path-line"></div>
                <div className="location end">
                  <div className="dot"></div>
                  <div className="location-name">{destination || "Destination"}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="receipt-footer">
            <div className="thank-you">Thank you for using TransitChain!</div>
            <div className="support">For support: support@transitchain.in</div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="download-pdf-btn" onClick={handleDownloadPDF}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 13L12 16L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download as PDF
          </button>
          
          <button className="share-screenshot-btn" onClick={handleShareScreenshot}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 10.5L15 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 13.5L15 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Share as Screenshot
          </button>
        </div>
        
        <button className="home-button" onClick={() => navigate("/")}>
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;