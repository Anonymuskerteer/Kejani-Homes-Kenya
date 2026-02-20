// Load environment variables FIRST before any other imports
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Now import modules that depend on environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { setupSocket } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Configure CORS for Express - Allow multiple origins for development
const allowedOrigins = [
  'http://localhost:3000',
  'https://kejani-homes-kenya-u3yr-daorvrbzk-anonys-projects-99efd9cf.vercel.app',
  'https://kejani-homes-kenya-u3yr-b6g2osdaa-anonys-projects-99efd9cf.vercel.app',
  process.env.FRONTEND_URL // DevTunnel URL from environment
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Database connection
require('./config/db')();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/favorites', require('./routes/favoritesRoutes'));
app.use('/api/homes', require('./routes/homeRoutes'));
app.use('/api/listings', require('./routes/homeRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/users', require('./routes/profileRoutes'));
app.use('/api/admin/api', require('./routes/apiManagementRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Home Finding Backend API' });
});

// Setup Socket.io
setupSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});

module.exports = { app, server, io };
