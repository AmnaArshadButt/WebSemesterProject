const express = require('express');

const Product = require('../models/Product');
const Category = require('../models/category');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();

    let categoryCount = await Category.countDocuments();
    if (!categoryCount) {
      categoryCount = await Product.distinct('category').then((items) => items.filter(Boolean).length);
    }

    const lowStockCount = products.filter((product) => Number(product.stock || 0) <= 5).length;

    res.render('admin/dashboard', {
      products,
      stats: {
        productCount: products.length,
        categoryCount,
        lowStockCount
      },
      activePage: 'dashboard'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;