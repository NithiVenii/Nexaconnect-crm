const express = require('express');
const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route   GET /api/customers?search=&status=&source=&page=&limit=&sort=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, status, source, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (source) query.source = source;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .populate('assignedTo', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Customer.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  })
);

// @route   GET /api/customers/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id).populate('assignedTo', 'name email avatar');
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    const activities = await Activity.find({ customer: customer._id })
      .populate('performedBy', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, data: customer, activities });
  })
);

// @route   POST /api/customers
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const customer = await Customer.create({ ...req.body, createdBy: req.user._id });
    await Activity.create({
      type: 'system',
      customer: customer._id,
      message: `Customer "${customer.name}" was created`,
      performedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: customer });
  })
);

// @route   PUT /api/customers/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    await Activity.create({
      type: 'system',
      customer: customer._id,
      message: `Customer "${customer.name}" was updated`,
      performedBy: req.user._id,
    });
    res.json({ success: true, data: customer });
  })
);

// @route   DELETE /api/customers/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    await customer.deleteOne();
    res.json({ success: true, message: 'Customer deleted' });
  })
);

// @route   POST /api/customers/:id/activity  (log interaction)
router.post(
  '/:id/activity',
  asyncHandler(async (req, res) => {
    const { type, message } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    const activity = await Activity.create({
      type,
      message,
      customer: customer._id,
      performedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: activity });
  })
);

module.exports = router;
