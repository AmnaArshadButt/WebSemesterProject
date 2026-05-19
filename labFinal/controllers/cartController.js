/**
 * Cart Controller
 * Handles shopping cart operations using sessions
 */

const Product = require('../models/Product');

// Initialize cart in session if it doesn't exist
const ensureCart = (req) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  return req.session.cart;
};

// Get current cart
const getCart = (req) => {
  return ensureCart(req);
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = ensureCart(req);
    const requestedQuantity = parseInt(quantity, 10) || 1;

    // Find product to get details
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (Number(product.stock || 0) <= 0) {
      return res.status(409).json({
        success: false,
        error: `Sorry, ${product.name} is out of stock.`
      });
    }

    // Check if product already in cart
    const cartItem = cart.find(item => item.product.toString() === productId);

    const existingQuantity = cartItem ? Number(cartItem.quantity || 0) : 0;
    if (existingQuantity + requestedQuantity > Number(product.stock || 0)) {
      return res.status(409).json({
        success: false,
        error: `Only ${product.stock} unit${product.stock === 1 ? '' : 's'} of ${product.name} left in stock.`
      });
    }

    if (cartItem) {
      // Update quantity
      cartItem.quantity = existingQuantity + requestedQuantity;
    } else {
      // Add new item to cart
      cart.push({
        product: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: requestedQuantity
      });
    }

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save cart' });
      }
      res.json({ 
        success: true, 
        message: 'Item added to cart',
        cart
      });
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

// Remove item from cart
const removeFromCart = (req, res) => {
  try {
    const { productId } = req.body;
    const cart = ensureCart(req);

    req.session.cart = cart.filter(item => item.product.toString() !== productId);

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save cart' });
      }
      res.json({ 
        success: true, 
        message: 'Item removed from cart',
        cart: req.session.cart
      });
    });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

// Update quantity
const updateQuantity = (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = ensureCart(req);

    const cartItem = cart.find(item => item.product.toString() === productId);
    if (!cartItem) {
      return res.status(404).json({ error: 'Item not in cart' });
    }

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      // Remove item if quantity is 0 or less
      req.session.cart = cart.filter(item => item.product.toString() !== productId);
    } else {
      cartItem.quantity = qty;
    }

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save cart' });
      }
      res.json({ 
        success: true, 
        message: 'Quantity updated',
        cart: req.session.cart
      });
    });
  } catch (err) {
    console.error('Error updating quantity:', err);
    res.status(500).json({ error: 'Failed to update quantity' });
  }
};

// Get cart with totals
const getCartWithTotals = async (req, res) => {
  try {
    const cart = ensureCart(req);
    
    let totalAmount = 0;
    let totalItems = 0;

    cart.forEach(item => {
      totalItems += item.quantity;
      totalAmount += item.price * item.quantity;
    });

    res.json({ 
      success: true,
      cart,
      totalItems,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (err) {
    console.error('Error getting cart:', err);
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

// Clear cart
const clearCart = (req, res) => {
  try {
    req.session.cart = [];

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to clear cart' });
      }
      res.json({ 
        success: true, 
        message: 'Cart cleared'
      });
    });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  getCartWithTotals,
  clearCart
};
