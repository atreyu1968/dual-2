import express from 'express';
import cors from 'cors';
import { broadcastUpdate, initWebSocket } from '../websocket.js';
import { limiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginController } from '../controllers/auth.js';
import { initDb } from '../db.js';
import userRoutes from '../routes/users.js';
import groupRoutes from '../routes/groups.js';
import studentRoutes from '../routes/students.js';
import academicYearRoutes from '../routes/academicYears.js';
import companyRoutes from '../routes/companies.js';
import dashboardRoutes from '../routes/dashboard.js';

export const setupServer = async (app, server) => {
  try {
    // Initialize WebSocket
    initWebSocket(server);
    
    // Initialize database
    const db = await initDb();
    console.log('Database initialized');
    
    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10kb' }));
    app.use(limiter);
    
    // Login route (unprotected)
    app.post('/api/login', (req, res) => loginController(req, res, db));
    
    // Protected routes
    app.use('/api', authenticateToken);
    app.use('/api/users', userRoutes(db, broadcastUpdate));
    app.use('/api/groups', groupRoutes(db));
    app.use('/api/students', studentRoutes(db));
    app.use('/api/academic-years', academicYearRoutes(db));
    app.use('/api/companies', companyRoutes(db));
    app.use('/api/dashboard', dashboardRoutes(db));
    
    return db;
  } catch (err) {
    console.error('Failed to setup server:', err);
    throw err;
  }
};