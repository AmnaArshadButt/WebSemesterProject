const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const Product = require('../models/Product');
const Category = require('../models/category');
const { isAdmin } = require('../middlewares/auth');

const router = express.Router();

// Protect all admin routes with isAdmin middleware
router.use(isAdmin);

const uploadDirectory = path.join(__dirname, '..', 'public', 'uploads', 'products');

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const baseName = path
        .basename(file.originalname, extension)
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

      callback(null, `${Date.now()}-${baseName || 'product'}${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedTypes.includes(extension)) {
      return callback(new Error('Only image files are allowed.'));
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

async function loadAdminViewData() {
  // Combine Category docs and product-derived categories so dropdowns always include seeded categories
  const catDocs = await Category.find({}, { name: 1, _id: 0 }).sort({ name: 1 }).lean();
  const docNames = catDocs.map((c) => c.name).filter(Boolean);
  const productNames = await Product.distinct('category').then((items) => (items || []).filter(Boolean));
  const names = Array.from(new Set([...docNames, ...productNames])).sort((a, b) => a.localeCompare(b));

  return { categories: names };
}

async function loadCategoryOverview() {
  const categories = await Category.find({}).sort({ name: 1 }).lean();
  const productCategoryNames = await Product.distinct('category').then((items) => items.filter(Boolean).sort((left, right) => left.localeCompare(right)));
  const productCounts = await Product.aggregate([
    { $match: { category: { $type: 'string', $ne: '' } } },
    { $group: { _id: '$category', productCount: { $sum: 1 }, lowStockCount: { $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] } } } }
  ]);

  const countMap = new Map(productCounts.map((entry) => [entry._id, entry]));
  const categoryMap = new Map(categories.map((category) => [category.name, category]));
  const categoryNames = Array.from(new Set([
    ...categories.map((category) => category.name),
    ...productCategoryNames
  ])).sort((left, right) => left.localeCompare(right));

  return categoryNames.map((name) => {
    const category = categoryMap.get(name) || { name, slug: name.toLowerCase().trim().replace(/\s+/g, '-') };
    const stats = countMap.get(name) || { productCount: 0, lowStockCount: 0 };

    return {
      ...category,
      productCount: stats.productCount,
      lowStockCount: stats.lowStockCount
    };
  });
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

function resolveProductImage(req, fallbackImage = '') {
  if (req.file) {
    return `/uploads/products/${req.file.filename}`;
  }

  return String(req.body.currentImage ?? fallbackImage ?? '').trim();
}

async function removeUploadedFile(file) {
  if (!file || !file.path) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
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

router.get('/low-stock', async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ stock: 1, createdAt: -1 }).lean();
    const lowStockProducts = products.filter((product) => Number(product.stock || 0) <= 5);

    let categoryCount = await Category.countDocuments();
    if (!categoryCount) {
      categoryCount = await Product.distinct('category').then((items) => items.filter(Boolean).length);
    }

    res.render('admin/low-stock', {
      lowStockProducts,
      stats: {
        productCount: products.length,
        categoryCount,
        lowStockCount: lowStockProducts.length
      },
      activePage: 'low-stock'
    });
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await loadCategoryOverview();
    const totalProducts = await Product.countDocuments({});

    res.render('admin/category', {
      categories,
      stats: {
        categoryCount: categories.length,
        productCount: totalProducts,
        lowStockCount: categories.reduce((total, category) => total + Number(category.lowStockCount || 0), 0)
      },
      activePage: 'categories'
    });
  } catch (err) {
    next(err);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();

    if (!name) {
      const categories = await loadCategoryOverview();
      const totalProducts = await Product.countDocuments({});
      return res.status(400).render('admin/category', {
        categories,
        stats: {
          categoryCount: categories.length,
          productCount: totalProducts,
          lowStockCount: categories.reduce((total, category) => total + Number(category.lowStockCount || 0), 0)
        },
        activePage: 'categories',
        errors: ['Category name is required']
      });
    }

    // Avoid duplicates
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.redirect('/admin/categories');
    }

    await Category.create({ name, description });
    return res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
});

// Render edit form for a category
router.get('/categories/:id/edit', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).send('Category not found');

    res.render('admin/category-form', {
      mode: 'edit',
      category,
      formAction: `/admin/categories/${category._id}`,
      activePage: 'categories',
      errors: []
    });
  } catch (err) {
    next(err);
  }
});

// Update category
router.post('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send('Category not found');

    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    if (!name) {
      return res.status(400).render('admin/category-form', {
        mode: 'edit',
        category: { ...category.toObject(), name, description },
        formAction: `/admin/categories/${category._id}`,
        activePage: 'categories',
        errors: ['Category name is required']
      });
    }

    category.name = name;
    category.description = description;
    await category.save();
    return res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
});

// Delete category
router.post('/categories/:id/delete', async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    return res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
});

// Admin view: render storefront inside admin layout
router.get('/storefront-view', async (req, res, next) => {
  try {
    // Minimal data for storefront preview
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(12).lean();
    const categories = await Category.find({}, { name: 1, _id: 0 }).sort({ name: 1 }).lean().then((c) => c.map((x) => x.name));

    res.render('admin/storefront-view', {
      products,
      categories,
      activePage: 'storefront'
    });
  } catch (err) {
    next(err);
  }
});

// Admin view: render product catalog inside admin layout
router.get('/products-view', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 12;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments({});
    const products = await Product.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit) || 1;

    res.render('admin/products-view', {
      products,
      page,
      totalPages,
      total,
      activePage: 'products'
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
      errors: [],
      product: null
    });
  } catch (err) {
    next(err);
  }
});

router.post('/products', imageUpload.single('imageFile'), async (req, res, next) => {
  try {
    const { categories } = await loadAdminViewData();
    const formData = buildProductFormData(req.body);
    const errors = validateProductForm(formData);
    const image = resolveProductImage(req);

    if (errors.length) {
      await removeUploadedFile(req.file);

      return res.status(400).render('admin/product-form', {
        mode: 'create',
        formAction: '/admin/products',
        formData,
        categories,
        errors,
        product: null
      });
    }

    await Product.create({
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: formData.category,
      image,
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

router.post('/products/:id', imageUpload.single('imageFile'), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const { categories } = await loadAdminViewData();
    const formData = buildProductFormData(req.body, product);
    const errors = validateProductForm(formData);
    const image = resolveProductImage(req, product.image);

    if (errors.length) {
      await removeUploadedFile(req.file);

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
    product.image = image;
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

router.use(async (err, req, res, next) => {
  if (err && err.message === 'Only image files are allowed.') {
    const { categories } = await loadAdminViewData();
    const isEditRoute = /^\/admin\/products\/[^/]+$/.test(req.originalUrl);

    return res.status(400).render('admin/product-form', {
      mode: isEditRoute ? 'edit' : 'create',
      formAction: isEditRoute ? req.originalUrl : '/admin/products',
      formData: buildProductFormData(req.body),
      categories,
      errors: [err.message],
      product: null
    });
  }

  return next(err);
});

module.exports = router;