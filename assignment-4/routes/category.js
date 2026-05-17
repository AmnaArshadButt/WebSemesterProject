const express = require('express');
const Category = require('../models/category');
const Product = require('../models/Product');

const router = express.Router();

/**
 * GET /categories
 * Query params:
 * - name: comma-separated or repeated category names
 * - slug: comma-separated or repeated category slugs
 */
router.get('/', async (req, res, next) => {
	try {
		const names = Category.parseListParam(req.query.name);
		const slugs = Category.parseListParam(req.query.slug);

		let categories = await Category.findByNamesOrSlugs(names, slugs).lean();

		if (!categories.length && !names.length && !slugs.length) {
			const productCategories = await Product.distinct('category');
			categories = productCategories.map((name) => ({
				name,
				slug: name.toLowerCase().trim().replace(/\s+/g, '-')
			}));
		}

		return res.json({
			count: categories.length,
			categories
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
