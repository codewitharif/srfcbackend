const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const db = require('./config/db');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Shree Ram Finance Chatbot API',
    version: '1.0.0',
    status: 'running'
  });
});

// API routes
app.use('/api', require('./routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

app.get("/",(req, res,) => {
  res.status(200).json({message :  'Shree Ram Finance Chatbot API'});
});

// Start server
async function start() {
  try {
    // run a lightweight test query to verify DB connectivity
    await db.query('SELECT 1');
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err.message || err);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();

module.exports = app;
