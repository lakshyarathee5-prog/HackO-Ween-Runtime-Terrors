require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/database');
const socketService = require('./services/socketService');
const expiryService = require('./services/expiryService');

const PORT = parseInt(process.env.PORT || '5001', 10);

let server;

async function startServer() {
  // Connect to Database
  await connectDB();

  // Auto-seed database if fresh / uninitialized
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Database is uninitialized. Running initial auto-seeding...');
      const seedDatabase = require('./utils/seedData');
      await seedDatabase({ standalone: false });
      console.log('[Database] Initial auto-seeding completed successfully.');
    }
  } catch (seedErr) {
    console.warn('[Database] Auto-seeding check notice:', seedErr.message);
  }

  server = http.createServer(app);

  // Initialize Real-Time WebSockets
  socketService.init(server);

  // Start Automated Food Safety & Expiry Monitoring Daemon
  expiryService.start();

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [Server Error] Port ${PORT} is already in use by another running process.`);
      console.error(`To release port ${PORT}, run this command in terminal:`);
      console.error(`  lsof -ti:${PORT} | xargs kill -9\n`);
    } else {
      console.error('[Server Error]', err);
    }
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  FoodResQ AI Full-Stack Server Running`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Local URL:   http://localhost:${PORT}`);
    console.log(`  API Health:  http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
  });

  const handleShutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    expiryService.stop();
    if (server) {
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Process terminated cleanly.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  process.on('unhandledRejection', (err) => {
    console.error('[Unhandled Rejection]', err);
  });

  process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]', err);
  });
}

startServer();
