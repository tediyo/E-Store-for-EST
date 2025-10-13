const express = require('express');
const Sale = require('../models/Sale');
const Item = require('../models/Item');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get comprehensive dashboard data
router.get('/overview', auth, async (req, res) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    
    let dateQuery = {};
    const now = new Date();
    
    // Set date range based on period
    switch (period) {
      case 'today':
        dateQuery = {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateQuery = { $gte: weekAgo, $lte: now };
        break;
      case 'month':
        dateQuery = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: now
        };
        break;
      case 'year':
        dateQuery = {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lte: now
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateQuery = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        break;
      default:
        // 'all' - no date filter
        break;
    }

    // Get sales data
    const salesQuery = { soldBy: req.user._id };
    if (dateQuery.$gte) salesQuery.saleDate = dateQuery;
    const salesStats = await Sale.aggregate([
      { $match: salesQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          storeSales: { $sum: { $cond: [{ $eq: ['$saleType', 'store'] }, 1, 0] } },
          outOfStoreSales: { $sum: { $cond: [{ $eq: ['$saleType', 'out_of_store'] }, 1, 0] } }
        }
      }
    ]);

    // Get items data
    const itemsQuery = { addedBy: req.user._id };
    if (dateQuery.$gte) itemsQuery.createdAt = dateQuery;
    const itemsStats = await Item.aggregate([
      { $match: itemsQuery },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$basePrice', '$quantity'] } },
          inStockItems: { $sum: { $cond: [{ $eq: ['$status', 'in_stock'] }, 1, 0] } },
          lowStockItems: { $sum: { $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0] } },
          outOfStockItems: { $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] } }
        }
      }
    ]);

    // Get tasks data
    const tasksQuery = { createdBy: req.user._id };
    if (dateQuery.$gte) tasksQuery.taskDate = dateQuery;
    const tasksStats = await Task.aggregate([
      { $match: tasksQuery },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          totalProfit: { $sum: '$netProfit' },
          totalCosts: { $sum: '$totalCost' },
          storeTasks: { $sum: { $cond: [{ $eq: ['$saleLocation', 'store'] }, 1, 0] } },
          outOfStoreTasks: { $sum: { $cond: [{ $eq: ['$saleLocation', 'out_of_store'] }, 1, 0] } }
        }
      }
    ]);

    // Get recent activities
    const recentSales = await Sale.find(salesQuery)
      .populate('item', 'name shoeType')
      .populate('soldBy', 'username')
      .sort({ saleDate: -1 })
      .limit(5);

    const recentItems = await Item.find(itemsQuery)
      .populate('addedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTasks = await Task.find(tasksQuery)
      .populate('createdBy', 'username')
      .sort({ taskDate: -1 })
      .limit(5);

    // Get shoe type distribution
    const shoeTypeStats = await Sale.aggregate([
      { $match: salesQuery },
      {
        $group: {
          _id: '$item',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      {
        $group: {
          _id: '$itemDetails.shoeType',
          count: { $sum: '$count' },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Calculate totals
    const salesData = salesStats[0] || {
      totalSales: 0,
      totalRevenue: 0,
      totalProfit: 0,
      storeSales: 0,
      outOfStoreSales: 0
    };

    const itemsData = itemsStats[0] || {
      totalItems: 0,
      totalValue: 0,
      inStockItems: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    };

    const tasksData = tasksStats[0] || {
      totalTasks: 0,
      totalProfit: 0,
      totalCosts: 0,
      storeTasks: 0,
      outOfStoreTasks: 0
    };

    res.json({
      period,
      dateRange: dateQuery,
      summary: {
        totalTransactions: salesData.totalSales + tasksData.totalTasks,
        totalProfit: salesData.totalProfit + tasksData.totalProfit,
        totalRevenue: salesData.totalRevenue,
        totalCosts: tasksData.totalCosts
      },
      sales: {
        totalSales: salesData.totalSales,
        totalRevenue: salesData.totalRevenue,
        totalProfit: salesData.totalProfit,
        storeSales: salesData.storeSales,
        outOfStoreSales: salesData.outOfStoreSales
      },
      inventory: {
        totalItems: itemsData.totalItems,
        totalValue: itemsData.totalValue,
        inStockItems: itemsData.inStockItems,
        lowStockItems: itemsData.lowStockItems,
        outOfStockItems: itemsData.outOfStockItems
      },
      tasks: {
        totalTasks: tasksData.totalTasks,
        totalProfit: tasksData.totalProfit,
        totalCosts: tasksData.totalCosts,
        storeTasks: tasksData.storeTasks,
        outOfStoreTasks: tasksData.outOfStoreTasks
      },
      recentActivities: {
        sales: recentSales,
        items: recentItems,
        tasks: recentTasks
      },
      analytics: {
        shoeTypeDistribution: shoeTypeStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get time-based analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let dateQuery = {};
    const now = new Date();
    
    // Set date range
    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      switch (period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateQuery = { $gte: weekAgo, $lte: now };
          break;
        case 'month':
          dateQuery = {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: now
          };
          break;
        case 'year':
          dateQuery = {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lte: now
          };
          break;
      }
    }

    // Get daily/weekly/monthly breakdown
    let groupBy = {};
    if (period === 'week' || (startDate && endDate && 
        (new Date(endDate) - new Date(startDate)) <= 7 * 24 * 60 * 60 * 1000)) {
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } };
    } else if (period === 'month') {
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } };
    } else {
      groupBy = { $dateToString: { format: "%Y-%m", date: "$saleDate" } };
    }

    const salesTrend = await Sale.aggregate([
      { $match: { soldBy: req.user._id, saleDate: dateQuery } },
      {
        $group: {
          _id: groupBy,
          sales: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          profit: { $sum: '$profit' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const tasksTrend = await Task.aggregate([
      { $match: { createdBy: req.user._id, taskDate: dateQuery } },
      {
        $group: {
          _id: groupBy,
          tasks: { $sum: 1 },
          profit: { $sum: '$netProfit' },
          costs: { $sum: '$totalCost' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      period,
      dateRange: dateQuery,
      salesTrend,
      tasksTrend
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
