/**
 * Main application entrypoint (modularized)
 * - Loads environment variables
 * - Connects to MongoDB via Mongoose
 * - Registers routes and middleware
 */
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// Load environment variables from .env
require('dotenv').config();

const connectDB = require('./config/db');
const productsRouter = require('./routes/products');
const categoryRouter = require('./routes/category');
const adminRouter = require('./routes/admin');
const apiV1Router = require('./routes/api/v1');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB (config/db.js handles connection details)
connectDB();

// View engine and static assets
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions (stored in MongoDB) + flash messages
app.use(session({
    secret: process.env.SESSION_SECRET || 'devsecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/khadi-replica', collectionName: 'sessions' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(flash());

// Expose flash messages and current user to views
const User = require('./models/User');
app.use(async (req, res, next) => {
    try {
        if (req.session && req.session.userId) {
            // attach full user to req.user for middleware convenience
            req.user = await User.findById(req.session.userId).lean();
            res.locals.currentUser = req.user;
        } else {
            res.locals.currentUser = null;
        }
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        next();
    } catch (err) {
        next(err);
    }
});

// Basic landing page (existing)
const Product = require('./models/Product');
const Category = require('./models/category');
app.get('/', async (req, res, next) => {
    try {
        // Fetch distinct categories for navbar dropdown
        let categories = (await Category.find({}, { name: 1, _id: 0 }).sort({ name: 1 }).lean()).map((cat) => cat.name);
        if (!categories.length) {
            categories = await Product.distinct('category');
        }
        // Render the shop index view (project uses views/shop/index.ejs)
        res.render('shop/index', { categories });
    } catch (err) {
        console.error('Error fetching categories for index:', err);
        return next(err);
    }
});

// Mount routers
app.use('/products', productsRouter);
app.use('/categories', categoryRouter);
app.use('/admin', adminRouter);
app.use('/api/v1', apiV1Router);

// Auth and checkout
const authRouter = require('./routes/auth');
const checkoutRouter = require('./routes/checkout');
app.use(authRouter);
app.use('/checkout', checkoutRouter);

// Simple error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});