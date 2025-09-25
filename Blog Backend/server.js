const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blog Management API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

/**
 * Socket.IO Real-time User Activity Tracking
 * Handles user online/offline status and last active time
 */
io.on('connection', async (socket) => {
  const userId = socket.handshake.query.userId;
  
  console.log(`🔌 User ${userId} connected via Socket.IO`);

  if (!userId) {
    console.log('❌ No userId provided in socket connection');
    socket.disconnect();
    return;
  }

  try {
    // Mark user as online and update last active time
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        isOnline: true, 
        lastActive: new Date() 
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log(`❌ User ${userId} not found`);
      socket.disconnect();
      return;
    }

    console.log(`✅ User ${updatedUser.name} (${updatedUser.email}) is now online`);

    // Broadcast user status change to all connected clients
    io.emit('user_status_change', {
      userId: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isOnline: true,
      lastActive: updatedUser.lastActive,
      role: updatedUser.role
    });

    // Handle user activity (heartbeat)
    socket.on('user_activity', async () => {
      try {
        await User.findByIdAndUpdate(userId, { lastActive: new Date() });
        console.log(`💓 User ${userId} activity updated`);
      } catch (error) {
        console.error('Error updating user activity:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { 
            isOnline: false, 
            lastActive: new Date() 
          },
          { new: true }
        );

        if (user) {
          console.log(`🔌 User ${user.name} (${user.email}) disconnected`);

          // Broadcast user status change to all connected clients
          io.emit('user_status_change', {
            userId: user._id,
            name: user.name,
            email: user.email,
            isOnline: false,
            lastActive: user.lastActive,
            role: user.role
          });
        }
      } catch (error) {
        console.error('Error handling user disconnect:', error);
      }
    });

  } catch (error) {
    console.error('Error handling socket connection:', error);
    socket.disconnect();
  }
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🔌 Socket.IO server ready for real-time connections`);
});
