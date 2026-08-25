const express = require('express');
const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route   GET /api/leads?search=&status=&priority=&page=&limit=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, status, priority, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'name email avatar')
        .populate('customer', 'name email company')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum },
    });
  })
);

// @route   GET /api/leads/pipeline  (all leads grouped by status for kanban board)
router.get(
  '/pipeline',
  asyncHandler(async (req, res) => {
    const leads = await Lead.find()
      .populate('assignedTo', 'name email avatar')
      .populate('customer', 'name company')
      .sort('position');

    const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
    const grouped = statuses.reduce((acc, s) => ({ ...acc, [s]: [] }), {});
    leads.forEach((lead) => grouped[lead.status]?.push(lead));

    res.json({ success: true, data: grouped });
  })
);

// @route   GET /api/leads/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('customer', 'name email company');
    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }
    const activities = await Activity.find({ lead: lead._id }).populate('performedBy', 'name avatar').sort('-createdAt');
    res.json({ success: true, data: lead, activities });
  })
);

// @route   POST /api/leads
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const count = await Lead.countDocuments({ status: req.body.status || 'New' });
    const lead = await Lead.create({ ...req.body, createdBy: req.user._id, position: count });
    await Activity.create({
      type: 'system',
      lead: lead._id,
      message: `Lead "${lead.title}" was created with status "${lead.status}"`,
      performedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: lead });
  })
);

// @route   PUT /api/leads/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await Lead.findById(req.params.id);
    if (!existing) {
      res.status(404);
      throw new Error('Lead not found');
    }
    const statusChanged = req.body.status && req.body.status !== existing.status;

    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (statusChanged) {
      await Activity.create({
        type: 'status-change',
        lead: lead._id,
        message: `Lead status changed from "${existing.status}" to "${lead.status}"`,
        performedBy: req.user._id,
      });
    }
    res.json({ success: true, data: lead });
  })
);

// @route   PUT /api/leads/:id/move  (kanban drag & drop - change status/position)
router.put(
  '/:id/move',
  asyncHandler(async (req, res) => {
    const { status, position } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }
    const oldStatus = lead.status;
    lead.status = status;
    lead.position = position ?? lead.position;
    await lead.save();

    if (oldStatus !== status) {
      await Activity.create({
        type: 'status-change',
        lead: lead._id,
        message: `Lead moved from "${oldStatus}" to "${status}" on the pipeline board`,
        performedBy: req.user._id,
      });
    }
    res.json({ success: true, data: lead });
  })
);

// @route   DELETE /api/leads/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }
    await lead.deleteOne();
    res.json({ success: true, message: 'Lead deleted' });
  })
);

module.exports = router;
