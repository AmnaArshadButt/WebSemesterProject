/**
 * Mongoose Product model
 * Required fields for the assignment: name, price, category, rating, stock
 * Extra helpful fields: image, description, createdAt
 */
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  // We'll store a simple numeric rating (e.g., 4.5)
  rating: { type: Number, default: 0, min: 0, max: 5 },
  stock: { type: Number, default: 0, min: 0 },
  image: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
