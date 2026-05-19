/**
 * Cart Routes
 * API endpoints for cart operations
 */

const express = require('express');
const router = express.Router();
const {
  addToCart,
  removeFromCart,
  updateQuantity,
  getCartWithTotals,
  clearCart
} = require('../controllers/cartController');

// Get cart view page
router.get('/view', (req, res) => {
  res.render('shop/cart');
});

// Get cart with totals (API)
router.get('/', getCartWithTotals);

// Add item to cart
router.post('/add', addToCart);

// Remove item from cart
router.post('/remove', removeFromCart);

// Update quantity
router.post('/update-quantity', updateQuantity);

// Clear cart
router.post('/clear', clearCart);

module.exports = router;
