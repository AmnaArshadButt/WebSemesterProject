/**
 * Checkout Controller
 * Handles order creation and payment/checkout logic
 */

const Order = require('../models/Order');
const Product = require('../models/Product');

// Render checkout page with cart data
const getCheckoutPage = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    
    // Calculate totals
    let totalAmount = 0;
    let totalItems = 0;

    cart.forEach(item => {
      totalItems += item.quantity;
      totalAmount += item.price * item.quantity;
    });

    res.render('shop/checkout', {
      activePage: 'checkout',
      cart,
      totalItems,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (err) {
    console.error('Error getting checkout page:', err);
    res.status(500).render('error', { error: 'Failed to load checkout page' });
  }
};

// Process checkout (create order and decrease stock)
const processCheckout = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.user || !req.session.userId) {
      req.flash('error', 'Please log in to checkout');
      return res.redirect('/login');
    }

    const { shippingAddress } = req.body;
    const cart = req.session.cart || [];

    // Validate cart
    if (!cart || cart.length === 0) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/products');
    }

    if (!shippingAddress || shippingAddress.trim() === '') {
      req.flash('error', 'Shipping address is required');
      return res.redirect('/checkout');
    }

    // Validate and prepare order items
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart) {
      // Get product from database to verify price and check stock
      const product = await Product.findById(cartItem.product);
      
      if (!product) {
        req.flash('error', `Product ${cartItem.name} no longer exists`);
        return res.redirect('/checkout');
      }

      if (product.stock < cartItem.quantity) {
        req.flash('error', `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`);
        return res.redirect('/checkout');
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity
      });

      totalAmount += product.price * cartItem.quantity;
    }

    // Create order
    const order = new Order({
      user: req.session.userId,
      items: orderItems,
      totalAmount,
      shippingAddress
    });

    // Save order first
    await order.save();

    // Decrease stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    req.session.cart = [];
    req.session.save();

    req.flash('success', `Order placed successfully! Order ID: ${order._id}`);
    res.redirect(`/checkout/confirmation/${order._id}`);
  } catch (err) {
    console.error('Error processing checkout:', err);
    req.flash('error', 'Failed to process checkout. Please try again.');
    res.redirect('/checkout');
  }
};

// Get order confirmation
const getOrderConfirmation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name price image');

    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/products');
    }

    // Verify user owns this order
    if (order.user._id.toString() !== req.session.userId) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/products');
    }

    res.render('shop/order-confirmation', {
      order
    });
  } catch (err) {
    console.error('Error getting order confirmation:', err);
    res.status(500).render('error', { error: 'Failed to load order confirmation' });
  }
};

// Get user's orders
const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }

    const orders = await Order.find({ user: req.session.userId })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.render('shop/my-orders', {
      orders
    });
  } catch (err) {
    console.error('Error getting orders:', err);
    res.status(500).render('error', { error: 'Failed to load orders' });
  }
};

module.exports = {
  getCheckoutPage,
  processCheckout,
  getOrderConfirmation,
  getMyOrders
};
