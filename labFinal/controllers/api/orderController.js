const Order = require('../../models/Order');
const Product = require('../../models/Product');

async function createOrder(req, res, next) {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user && req.user.user_id;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !String(shippingAddress).trim()) {
      return res.status(400).json({
        message: 'Shipping address is required'
      });
    }

    const normalizedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const productId = item.productId || item.product || item._id;
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (!productId) {
        return res.status(400).json({
          message: 'Each item must include a product id'
        });
      }

      const product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(404).json({
          message: `Product not found for item ${productId}`
        });
      }

      const lineTotal = product.price * quantity;
      totalAmount += lineTotal;

      normalizedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity
      });
    }

    const order = await Order.create({
      user: userId,
      items: normalizedItems,
      totalAmount,
      shippingAddress: String(shippingAddress).trim(),
      status: 'pending'
    });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder
};