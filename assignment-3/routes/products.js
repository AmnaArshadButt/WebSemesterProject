/**
 * Products router
 * Phase 1: provide a simple, paginated JSON endpoint backed by Mongoose.
 * Later phases will render EJS and add filtering/search/sorting.
 */
const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/category');
const { buildProductQuery } = require('../utils/queryBuilder');

const router = express.Router();

/**
 * GET /products
 * Query params (phase 1): page (defaults to 1)
 * Response: JSON with pagination metadata and products array
 */
router.get('/', async (req, res, next) => {
  try {
    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 8; // assignment requirement
    const skip = (page - 1) * limit;

    // Build filter & sort from query params
    const { filter, sort } = buildProductQuery(req.query);

    // Total matching documents for pagination metadata
    const total = await Product.countDocuments(filter);
    // Fetch page of results with applied filters and sort
    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit) || 1;

    // If client accepts HTML, render the EJS view; otherwise return JSON
    if (req.accepts && req.accepts('html')) {
      // Provide category list for filter dropdown
      let categories = (await Category.find({}, { name: 1, _id: 0 }).sort({ name: 1 }).lean()).map((cat) => cat.name);
      if (!categories.length) {
        categories = await Product.distinct('category');
      }

      const filters = {
        q: '',
        category: '',
        minPrice: '0',
        maxPrice: '',
        sort: '',
        ...req.query
      };

      return res.render('products', {
        products,
        page,
        totalPages,
        total,
        count: products.length,
        filters,
        categories,
        sort
      });
    }

    // Default: JSON response for API consumers
    res.json({
      page,
      totalPages,
      total,
      count: products.length,
      filters: req.query,
      sort,
      products
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
