const Product = require('../../models/Product');
const Category = require('../../models/category');
const { buildProductQuery } = require('../../utils/queryBuilder');

async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 8;
    const skip = (page - 1) * limit;

    const { filter, sort } = buildProductQuery(req.query);

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit) || 1;

    let categories = (await Category.find({}, { name: 1, _id: 0 }).sort({ name: 1 }).lean()).map((category) => category.name);
    if (!categories.length) {
      categories = await Product.distinct('category');
    }

    res.json({
      page,
      totalPages,
      total,
      count: products.length,
      filters: req.query,
      sort,
      categories,
      products
    });
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json({ product });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProductById
};