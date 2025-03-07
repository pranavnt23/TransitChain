const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Define User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  upiId: {
    type: String,
    required: true
  },
  upiPin: {
    type: String, // Hashed PIN
    required: true
  },
  cards: [{
    cardNumber: String, // Last 4 digits only for security
    cardName: String,
    expiryDate: String,
    cvv: String, // Hashed CVV
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  balance: {
    type: Number,
    default: 100000 // Initial balance of 100,000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('TransitChain_Users', userSchema);

// Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  fromUser: {
    type: String,
    required: true
  },
  toEntity: {
    type: String,
    default: 'transitchain.in'
  },
  amount: {
    type: Number,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['upi', 'card', 'netbanking'],
    required: true
  },
  paymentDetails: {
    cardLast4: String,
    cardName: String,
    upiId: String,
    bank: String
  },
  source: String,
  destination: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Transaction = mongoose.model('TransitChain_Transactions', transactionSchema);

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate UPI ID from email
    const upiId = generateUpiId(email);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Hash default UPI PIN (1234)
    const hashedUpiPin = await bcrypt.hash('1234', salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      upiId,
      upiPin: hashedUpiPin,
      cards: [],
      balance: 100000 // Initial balance
    });

    await user.save();
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        username: user.username,
        email: user.email,
        upiId: user.upiId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Get cards info (but only send limited data for security)
    const cards = user.cards.map(card => ({
      cardLast4: card.cardNumber,
      cardName: card.cardName,
      expiryDate: card.expiryDate,
      isDefault: card.isDefault
    }));

    // Return user data
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        upiId: user.upiId,
        balance: user.balance,
        cards: cards
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPI Verification endpoint
app.post('/api/verify-upi', async (req, res) => {
  const { upiId } = req.body;

  try {
    const user = await User.findOne({ upiId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid UPI ID. Please check and try again.' 
      });
    }

    res.json({
      success: true,
      username: user.username
    });
  } catch (error) {
    console.error('UPI verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during UPI verification' 
    });
  }
});

// Card Verification endpoint
// In server.js - Update the card verification endpoint
app.post('/api/verify-card', async (req, res) => {
    const { cardNumber, cardName, expiry } = req.body;
  
    try {
      // Now we're already receiving the last 4 digits from frontend
      const last4Digits = cardNumber;
      
      // Try to find a user with this card
      const user = await User.findOne({
        "cards": {
          $elemMatch: {
            "cardNumber": last4Digits,
            "cardName": cardName,
            "expiryDate": expiry
          }
        }
      });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Card not found or details don\'t match.' 
        });
      }
  
      res.json({
        success: true,
        username: user.username
      });
    } catch (error) {
      console.error('Card verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during card verification' 
      });
    }
  });

  // Add this new endpoint for netbanking verification
app.post('/api/verify-netbanking', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found. Please check your email address.' 
        });
      }
  
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid password. Please try again.' 
        });
      }
  
      res.json({
        success: true,
        username: user.username
      });
    } catch (error) {
      console.error('Netbanking verification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during netbanking verification' 
      });
    }
  });

// UPI Payment endpoint
app.post('/api/payment/upi', async (req, res) => {
  const { upiId, upiPin, amount, source, destination } = req.body;

  try {
    // Find user by UPI ID
    const user = await User.findOne({ upiId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid UPI ID' 
      });
    }

    // Verify UPI PIN
    const isPinValid = await bcrypt.compare(upiPin, user.upiPin);
    if (!isPinValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid UPI PIN' 
      });
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }

    // Generate transaction ID
    const transactionId = `TX${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create transaction record
    const transaction = new Transaction({
      transactionId,
      fromUser: user.username,
      toEntity: 'transitchain.in',
      amount,
      transactionType: 'upi',
      paymentDetails: {
        upiId: upiId
      },
      source,
      destination,
      status: 'success'
    });

    // Update user balance
    user.balance -= amount;

    // Save changes
    await Promise.all([
      transaction.save(),
      user.save()
    ]);

    res.json({
      success: true,
      message: 'Payment successful',
      transactionId,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('UPI payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during payment processing' 
    });
  }
});

// Card payment endpoint
app.post('/api/payment/card', async (req, res) => {
  const { cardDetails, amount, source, destination } = req.body;
  const { cardNumber, cardName, expiry, cvv } = cardDetails;

  try {
    // Format the card number - store only last 4 digits for security
    const last4Digits = cardNumber;
    
    // Try to find a user with matching card name
    const user = await User.findOne({ 
        "cards": {
          $elemMatch: {
            "cardNumber": last4Digits,
            "cardName": cardName,
            "expiryDate": expiry
          }
        }
      });
    
    // If no existing card found, check for username match to add new card
    let foundUser = user;
    if (!foundUser && req.body.username) {
      foundUser = await User.findOne({ username: req.body.username });
    }
    
    if (!foundUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Card validation failed. Please check your details or create an account.' 
      });
    }

    // Check if user has sufficient balance
    if (foundUser.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }

    // If this is a new card, add it to the user's cards array
    let cardFound = false;
    for (let card of foundUser.cards) {
        if (card.cardNumber === last4Digits && card.cardName === cardName && card.expiryDate === expiry) {
          cardFound = true;
          // Verify CVV
          const isCvvValid = await bcrypt.compare(cvv, card.cvv);
          if (!isCvvValid) {
            return res.status(400).json({
              success: false,
              message: 'Invalid CVV'
            });
          }
          break;
        }
      }

    if (!cardFound) {
      // Hash the CVV before storing
      const salt = await bcrypt.genSalt(10);
      const hashedCvv = await bcrypt.hash(cvv, salt);
      
      // Add new card to user's cards
      foundUser.cards.push({
        cardNumber: last4Digits,
        cardName: cardName,
        expiryDate: expiry,
        cvv: hashedCvv,
        isDefault: foundUser.cards.length === 0 // Make default if first card
      });
    }

    // Generate transaction ID
    const transactionId = `CD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create transaction record
    const transaction = new Transaction({
      transactionId,
      fromUser: foundUser.username,
      toEntity: 'transitchain.in',
      amount,
      transactionType: 'card',
      paymentDetails: {
        cardLast4: last4Digits,
        cardName: cardName
      },
      source,
      destination,
      status: 'success'
    });

    // Update user balance
    foundUser.balance -= amount;

    // Save changes
    await Promise.all([
      transaction.save(),
      foundUser.save()
    ]);

    res.json({
      success: true,
      message: 'Card payment successful',
      transactionId,
      newBalance: foundUser.balance
    });
  } catch (error) {
    console.error('Card payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during payment processing' 
    });
  }
});

// Netbanking payment endpoint
app.post('/api/payment/netbanking', async (req, res) => {
    const { email, amount, bank, source, destination, transactionPin } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
  
      // Verify transaction PIN
      const isPinValid = await bcrypt.compare(transactionPin, user.upiPin); // Using upiPin field to store transaction PIN
      if (!isPinValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid transaction PIN' 
        });
      }
  
      // Check if user has sufficient balance
      if (user.balance < amount) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient balance' 
        });
      }
  
      // Generate transaction ID
      const transactionId = `NB${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
      // Create transaction record
      const transaction = new Transaction({
        transactionId,
        fromUser: user.username,
        toEntity: 'transitchain.in',
        amount,
        transactionType: 'netbanking',
        paymentDetails: {
          bank: bank
        },
        source,
        destination,
        status: 'success'
      });
  
      // Update user balance
      user.balance -= amount;
  
      // Save changes
      await Promise.all([
        transaction.save(),
        user.save()
      ]);
  
      res.json({
        success: true,
        message: 'Netbanking payment successful',
        transactionId,
        newBalance: user.balance
      });
    } catch (error) {
      console.error('Netbanking payment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during payment processing' 
      });
    }
  });

// Helper function to generate UPI ID from email
function generateUpiId(email) {
  if (!email) return '';
  
  const username = email.split('@')[0];
  return `${username}@okicici`;
}

// Use other routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));