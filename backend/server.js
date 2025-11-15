const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/receipts', require('./routes/receipts'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static files (in production)
// Try multiple possible paths for frontend dist
const fs = require('fs');
const possibleFrontendPaths = [
  path.join(__dirname, '../frontend/dist'),  // Docker/relative path
  path.join(__dirname, '../../frontend/dist'), // Alternative structure
  path.join(process.cwd(), 'frontend/dist'), // Current working directory
  path.join(process.cwd(), '../frontend/dist'), // Parent directory
];

let frontendPath = null;
for (const possiblePath of possibleFrontendPaths) {
  if (fs.existsSync(possiblePath)) {
    frontendPath = possiblePath;
    console.log(`✓ Frontend found at: ${frontendPath}`);
    break;
  }
}

if (process.env.NODE_ENV === 'production' && frontendPath) {
  app.use(express.static(frontendPath));
  console.log(`✓ Serving frontend static files from: ${frontendPath}`);
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else if (process.env.NODE_ENV === 'production') {
  console.warn('⚠ Frontend dist folder not found. Serving API only.');
  console.warn('Checked paths:', possibleFrontendPaths);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

