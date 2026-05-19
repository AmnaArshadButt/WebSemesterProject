/**
 * Sales Dashboard Controller
 * Handles real-time sales statistics and analytics
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/category');

const buildSalesDashboardData = async () => {
  try {
    // Total Revenue
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const totalOrders = revenueData[0]?.totalOrders || 0;

    // Top-Selling Products
    const topProducts = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          productName: { $first: '$items.name' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Recent Orders (last 10)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Daily Revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Order Status Distribution
    const orderStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format daily revenue for chart
    const chartData = dailyRevenue.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders
    }));

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      topProducts,
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        user: order.user,
        totalAmount: order.totalAmount,
        status: order.status,
        itemCount: order.items.length,
        createdAt: order.createdAt,
        items: order.items
      })),
      dailyRevenue: chartData,
      orderStatus,
      averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0
    };
  } catch (err) {
    console.error('Error getting sales data:', err);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      topProducts: [],
      recentOrders: [],
      dailyRevenue: [],
      orderStatus: [],
      averageOrderValue: 0
    };
  }
};

// Get sales data for dashboard API
const getSalesData = async (req, res) => {
  try {
    const dashboardData = await buildSalesDashboardData();

    res.json(dashboardData);
  } catch (err) {
    console.error('Error getting sales data:', err);
    res.status(500).json({
      totalRevenue: 0,
      totalOrders: 0,
      topProducts: [],
      recentOrders: [],
      dailyRevenue: [],
      orderStatus: [],
      averageOrderValue: 0
    });
  }
};

// Render sales dashboard page
const getSalesDashboard = async (req, res) => {
  try {
    const initialData = await buildSalesDashboardData();

    let categories = [];
    try {
      const categoryDocs = await Category.find({}, { name: 1, _id: 0 }).sort({ name: 1 }).lean();
      categories = categoryDocs.map((category) => category.name);
    } catch (categoryErr) {
      console.error('Error loading sales page categories:', categoryErr);
    }

    res.render('sales', {
      layout: 'layout',
      title: 'Sales Dashboard',
      initialData,
      categories,
      activePage: 'sales'
    });
  } catch (err) {
    console.error('Error loading sales dashboard:', err);
    res.status(500).render('error', { error: 'Failed to load sales dashboard' });
  }
};

module.exports = {
  getSalesData,
  getSalesDashboard,
  buildSalesDashboardData
};
