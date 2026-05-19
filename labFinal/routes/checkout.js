const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/auth');
const {
  getCheckoutPage,
  processCheckout,
  getOrderConfirmation,
  getMyOrders
} = require('../controllers/checkoutController');

// GET checkout page (show cart and form)
router.get('/', isLoggedIn, getCheckoutPage);

// POST process checkout (create order)
router.post('/', isLoggedIn, processCheckout);

// GET my orders
router.get('/my-orders', isLoggedIn, getMyOrders);

// GET order confirmation (must be after /my-orders)
router.get('/confirmation/:orderId', isLoggedIn, getOrderConfirmation);

module.exports = router;
