const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST
dotenv.config({ path: './config.env' });

// THEN import passport after environment variables are loaded
const passport = require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ermishoe.vercel.app'
  ],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false
}));
app.options('*', cors({
  origin: [
    'http://localhost:3000',
    'https://ermishoe.vercel.app'
  ],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_system', {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000 // 45 seconds
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/out')));

// Catch all handler: send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
