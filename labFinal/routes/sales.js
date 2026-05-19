/**
 * Sales Routes
 * Admin dashboard and analytics endpoints
 */

const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/auth');
const { getSalesData, getSalesDashboard } = require('../controllers/salesController');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    req.flash('error', 'Unauthorized access');
    return res.redirect('/');
  }
  next();
};

// Sales dashboard page (server-side rendered)
router.get('/', isLoggedIn, isAdmin, getSalesDashboard);

// Sales data API (JSON)
router.get('/api/data', isLoggedIn, isAdmin, getSalesData);

// Secondary live update API route (strict JSON payload)
router.get('/api/sales-data', isLoggedIn, isAdmin, getSalesData);

module.exports = router;
