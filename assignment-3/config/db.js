/**
 * Database connection helper
 * Uses MONGODB_URI from environment or falls back to a local default.
 */
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/khadi-replica';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      // useNewUrlParser, useUnifiedTopology no longer necessary in recent mongoose
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit early - the app depends on DB access for the catalog
    process.exit(1);
  }
}

module.exports = connectDB;
