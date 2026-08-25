const express = require('express');
const asyncHandler = require('express-async-handler');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route   GET /api/activities?limit=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { limit = 20, customer, lead } = req.query;
    const query = {};
    if (customer) query.customer = customer;
    if (lead) query.lead = lead;

    const activities = await Activity.find(query)
      .populate('performedBy', 'name avatar')
      .populate('customer', 'name')
      .populate('lead', 'title')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.json({ success: true, data: activities });
  })
);

module.exports = router;
