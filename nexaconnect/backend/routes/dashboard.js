const express = require('express');
const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route   GET /api/dashboard/summary  (analytics cards)
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const [totalCustomers, activeLeads, wonLeads, completedTasks, totalTasks] = await Promise.all([
      Customer.countDocuments(),
      Lead.countDocuments({ status: { $nin: ['Won', 'Lost'] } }),
      Lead.find({ status: 'Won' }),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments(),
    ]);

    const salesRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeLeads,
        salesRevenue,
        completedTasks,
        totalTasks,
        taskCompletionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  })
);

// @route   GET /api/dashboard/recent-activity
router.get(
  '/recent-activity',
  asyncHandler(async (req, res) => {
    const activities = await Activity.find()
      .populate('performedBy', 'name avatar')
      .populate('customer', 'name')
      .populate('lead', 'title')
      .sort('-createdAt')
      .limit(8);
    res.json({ success: true, data: activities });
  })
);

// @route   GET /api/dashboard/charts  (data for bar/pie/line charts)
router.get(
  '/charts',
  asyncHandler(async (req, res) => {
    // Pie: leads by status
    const leadsByStatus = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    // Bar: revenue (won leads) by month for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const revenueByMonth = await Lead.aggregate([
      { $match: { status: 'Won', updatedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
          total: { $sum: '$value' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Line: new customers per month for last 6 months
    const customersByMonth = await Customer.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Bar: tasks by status
    const tasksByStatus = await Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    res.json({
      success: true,
      data: { leadsByStatus, revenueByMonth, customersByMonth, tasksByStatus },
    });
  })
);

module.exports = router;
