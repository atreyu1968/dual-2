import express from 'express';
import cors from 'cors';
import http from 'http';
import { setupServer } from './setup/server.js';
import { SERVER_CONFIG } from '../src/config.js';

const app = express();
const server = http.createServer(app);

const startServer = async () => {
  try {
    await setupServer(app, server);
    
    server.listen(SERVER_CONFIG.PORT, () => {
      console.log(`Server running on port ${SERVER_CONFIG.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

startServer();