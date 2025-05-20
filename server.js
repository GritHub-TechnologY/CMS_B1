import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import memberRoutes from './routes/member.routes.js';
import roleRoutes from './routes/role.routes.js';
import authRoutes from './routes/auth.routes.js';
import discipleshipRoutes from './routes/discipleship.routes.js';
import eventRoutes from './routes/event.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import { initializeRoles } from './models/role.model.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Initialize predefined roles
    try {
      await initializeRoles();
    } catch (error) {
      console.error('Error during role initialization:', error);
      // Continue server startup even if role initialization fails
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/discipleship', discipleshipRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const tryPort = async (port) => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port)
        .once('listening', () => {
          console.log(`Server is running on port ${port}`);
          resolve(server);
        })
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}`);
            resolve(null);
          } else {
            reject(err);
          }
        });
    });
  };

  try {
    let server = null;
    let currentPort = PORT;

    while (!server && currentPort < PORT + 10) {
      server = await tryPort(currentPort);
      if (!server) currentPort++;
    }

    if (!server) {
      throw new Error(`Could not find an available port between ${PORT} and ${PORT + 9}`);
    }

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 