const express = require('express');

const Product = require('../models/Product');
const Category = require('../models/category');

const router = express.Router();

async function loadAdminViewData() {
  let categories = await Category.find({}, { name: 1, _id: 0 }).sort({ name: 1 }).lean();
  categories = categories.map((category) => category.name);

  if (!categories.length) {
    categories = await Product.distinct('category');
  }

  return { categories };
}

function buildProductFormData(body = {}, existingProduct = null) {
  return {
    name: String(body.name ?? existingProduct?.name ?? '').trim(),
    price: String(body.price ?? existingProduct?.price ?? ''),
    stock: String(body.stock ?? existingProduct?.stock ?? '0'),
    category: String(body.category ?? existingProduct?.category ?? '').trim(),
    image: String(body.image ?? existingProduct?.image ?? '').trim(),
    description: String(body.description ?? existingProduct?.description ?? '').trim()
  };
}

function validateProductForm(data) {
  const errors = [];

  if (!data.name) errors.push('Product name is required.');
  if (!data.price || Number.isNaN(Number(data.price)) || Number(data.price) < 0) errors.push('Price must be a valid number.');
  if (!data.category) errors.push('Category is required.');
  if (data.stock === '' || Number.isNaN(Number(data.stock)) || Number(data.stock) < 0) errors.push('Stock must be a valid number.');

  return errors;
}

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

router.get('/products/new', async (req, res, next) => {
  try {
    const { categories } = await loadAdminViewData();

    res.render('admin/product-form', {
      mode: 'create',
      formAction: '/admin/products',
      formData: buildProductFormData(),
      categories,
      errors: []
    });
  } catch (err) {
    next(err);
  }
});

router.post('/products', async (req, res, next) => {
  try {
    const { categories } = await loadAdminViewData();
    const formData = buildProductFormData(req.body);
    const errors = validateProductForm(formData);

    if (errors.length) {
      return res.status(400).render('admin/product-form', {
        mode: 'create',
        formAction: '/admin/products',
        formData,
        categories,
        errors
      });
    }

    await Product.create({
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: formData.category,
      image: formData.image || '',
      description: formData.description || ''
    });

    return res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id/edit', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const { categories } = await loadAdminViewData();

    res.render('admin/product-form', {
      mode: 'edit',
      formAction: `/admin/products/${product._id}`,
      formData: buildProductFormData({}, product),
      categories,
      errors: [],
      product
    });
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const { categories } = await loadAdminViewData();
    const formData = buildProductFormData(req.body, product);
    const errors = validateProductForm(formData);

    if (errors.length) {
      return res.status(400).render('admin/product-form', {
        mode: 'edit',
        formAction: `/admin/products/${product._id}`,
        formData,
        categories,
        errors,
        product: product.toObject()
      });
    }

    product.name = formData.name;
    product.price = Number(formData.price);
    product.stock = Number(formData.stock);
    product.category = formData.category;
    product.image = formData.image || '';
    product.description = formData.description || '';

    await product.save();

    return res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/delete', async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

module.exports = router;