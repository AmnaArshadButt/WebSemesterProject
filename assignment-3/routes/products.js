/**
 * Products router
 * Phase 1: provide a simple, paginated JSON endpoint backed by Mongoose.
 * Later phases will render EJS and add filtering/search/sorting.
 */
const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

/**
 * GET /products
 * Query params (phase 1): page (defaults to 1)
 * Response: JSON with pagination metadata and products array
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 8; // assignment requirement
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments({});
    const products = await Product.find({}).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      totalPages,
      total,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
