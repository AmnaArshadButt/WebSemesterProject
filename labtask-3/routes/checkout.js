const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/auth');

// Simple checkout view protected by `isLoggedIn`
router.get('/', isLoggedIn, (req, res) => {
  res.render('shop/checkout', { activePage: 'checkout' });
});

module.exports = router;
