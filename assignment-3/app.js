/**
 * Main application entrypoint (modularized)
 * - Loads environment variables
 * - Connects to MongoDB via Mongoose
 * - Registers routes and middleware
 */
const express = require('express');
const path = require('path');

// Load environment variables from .env
require('dotenv').config();

const connectDB = require('./config/db');
const productsRouter = require('./routes/products');

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

// Basic landing page (existing)
const Product = require('./models/Product');
app.get('/', async (req, res) => {
    try {
        // Fetch distinct categories for navbar dropdown
        const categories = await Product.distinct('category');
        res.render('index', { categories });
    } catch (err) {
        console.error('Error fetching categories for index:', err);
        res.render('index', { categories: [] });
    }
});

// Mount products API / catalog router (phase 1: JSON + pagination skeleton)
app.use('/products', productsRouter);

// Simple error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});