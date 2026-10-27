const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security Headers (configured to allow Leaflet OSM tiles, Chart.js, FontAwesome, and cross-origin API access)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration — permissive for local development, demo sessions, and cross-port clients
app.use(cors({
  origin: function(origin, callback) {
    // Permissive for local development (supports file://, localhost, 127.0.0.1, VS Code Live Server)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API endpoints
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api', routes);

// Serve the frontend directly so full-stack app works at http://localhost:5001
const frontendRoot = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendRoot));
app.use('/frontend', express.static(frontendRoot));

// Fallback to index.html for root if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'));
});

// 404 for unmatched API routes
app.use('/api/*', notFoundHandler);

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
