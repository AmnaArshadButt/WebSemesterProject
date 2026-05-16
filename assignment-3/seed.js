/**
 * Simple DB seeder for Product collection
 * Run with: `node seeder/seed.js` (or `npm run seed`)
 * Expects MONGODB_URI in environment or falls back to the default in config/db.js
 */
const connectDB = require('./config/db');
const Product = require('./models/Product');
const slugify = require('slugify');

async function createSampleProducts() {
  // 30 sample products across categories for pagination/filter testing
  const sample = [
    { name: 'Wireless Headphones', price: 89.99, category: 'Electronics', rating: 4.4, stock: 25, image: '', description: 'Comfortable over-ear wireless headphones' },
    { name: 'Smartwatch Series 3', price: 129.99, category: 'Electronics', rating: 4.0, stock: 40, image: '', description: 'Health tracking smartwatch' },
    { name: 'Bluetooth Speaker', price: 45.0, category: 'Electronics', rating: 4.2, stock: 30, image: '', description: 'Portable speaker with rich bass' },
    { name: 'Men Casual Shirt', price: 29.99, category: 'Fashion', rating: 4.1, stock: 50, image: '', description: 'Cotton casual shirt' },
    { name: 'Women Summer Dress', price: 39.99, category: 'Fashion', rating: 4.6, stock: 35, image: '', description: 'Lightweight summer dress' },
    { name: 'Running Shoes', price: 59.99, category: 'Fashion', rating: 4.3, stock: 20, image: '', description: 'Comfortable running shoes' },
    { name: 'Ceramic Vase', price: 24.99, category: 'Home', rating: 4.0, stock: 60, image: '', description: 'Decorative ceramic vase' },
    { name: 'LED Desk Lamp', price: 34.5, category: 'Home', rating: 4.5, stock: 45, image: '', description: 'Adjustable brightness lamp' },
    { name: 'Cotton Bedsheet', price: 49.99, category: 'Home', rating: 4.2, stock: 22, image: '', description: 'King size breathable bedsheet' },
    { name: 'Yoga Mat', price: 19.99, category: 'Sports', rating: 4.1, stock: 80, image: '', description: 'Non-slip yoga mat' },
    { name: 'Dumbbell Set', price: 69.99, category: 'Sports', rating: 4.4, stock: 12, image: '', description: 'Adjustable weight dumbbells' },
    { name: 'Electric Kettle', price: 29.9, category: 'Home', rating: 4.0, stock: 33, image: '', description: '1.7L fast boiling kettle' },
    { name: 'Scented Candle Pack', price: 14.99, category: 'Home', rating: 4.3, stock: 120, image: '', description: 'Assorted fragrance candles' },
    { name: 'Leather Wallet', price: 25.0, category: 'Fashion', rating: 4.2, stock: 70, image: '', description: 'Genuine leather wallet' },
    { name: 'Noise-Cancelling Earbuds', price: 79.99, category: 'Electronics', rating: 4.3, stock: 55, image: '', description: 'In-ear noise-cancelling earbuds' },
    { name: 'Kitchen Knife Set', price: 59.99, category: 'Home', rating: 4.5, stock: 18, image: '', description: 'Stainless steel knife set' },
    { name: 'Face Moisturizer', price: 19.99, category: 'Beauty', rating: 4.0, stock: 100, image: '', description: 'Hydrating daily moisturizer' },
    { name: 'Perfume Spray', price: 49.99, category: 'Beauty', rating: 4.6, stock: 28, image: '', description: 'Long-lasting fragrance' },
    { name: 'Sunglasses', price: 22.5, category: 'Fashion', rating: 3.9, stock: 80, image: '', description: 'UV-protective sunglasses' },
    { name: 'Backpack', price: 39.0, category: 'Fashion', rating: 4.2, stock: 40, image: '', description: 'Durable travel backpack' },
    { name: 'Coffee Maker', price: 79.0, category: 'Home', rating: 4.1, stock: 15, image: '', description: 'Automatic coffee maker' },
    { name: 'Gaming Mouse', price: 49.99, category: 'Electronics', rating: 4.4, stock: 60, image: '', description: 'High DPI gaming mouse' },
    { name: 'Action Camera', price: 129.99, category: 'Electronics', rating: 4.2, stock: 10, image: '', description: 'Waterproof action camera' },
    { name: 'Tennis Racket', price: 69.95, category: 'Sports', rating: 4.0, stock: 25, image: '', description: 'Lightweight tennis racket' },
    { name: 'Hooded Sweatshirt', price: 45.0, category: 'Fashion', rating: 4.3, stock: 30, image: '', description: 'Comfortable cotton hoodie' },
    { name: 'Wireless Charger', price: 29.99, category: 'Electronics', rating: 4.1, stock: 75, image: '', description: 'Qi-certified fast charger' },
    { name: 'Bath Towel Set', price: 34.99, category: 'Home', rating: 4.0, stock: 50, image: '', description: 'Soft absorbent towels' },
    { name: 'Lipstick Set', price: 24.99, category: 'Beauty', rating: 4.2, stock: 90, image: '', description: 'Matte finish lipstick trio' },
    { name: 'Portable Projector', price: 199.99, category: 'Electronics', rating: 4.3, stock: 8, image: '', description: 'Mini portable projector' }
  ];

  // Add small variations to ensure uniqueness
 

  return sample.map((p, i) => {
    const name = `${p.name} ${i + 1}`;
    const categoryKeyword = p.category.split(' ')[0] || p.category;
    const image = `https://source.unsplash.com/800x600/?${encodeURIComponent(categoryKeyword)}`;
    return {
      ...p,
      name,
      image: image,
      slug: slugify(`${name}-${i + 1}`, { lower: true, strict: true })
    };
  });
}

async function run() {
  await connectDB();

  try {
    const products = await createSampleProducts();
    // Clear existing
    await Product.deleteMany({});
    // Insert seed data
    await Product.insertMany(products);
    console.log('Seed completed: inserted', products.length, 'products');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}
