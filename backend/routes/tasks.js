const express = require('express');
const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route   GET /api/tasks?status=&priority=&search=&page=&limit=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, priority, search, assignedTo, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.title = { $regex: search, $options: 'i' };

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name avatar email')
        .populate('createdBy', 'name avatar')
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum },
    });
  })
);

// @route   POST /api/tasks
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: task });
  })
);

// @route   PUT /api/tasks/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const updates = { ...req.body };
    if (updates.status === 'completed') updates.completedAt = new Date();
    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json({ success: true, data: task });
  })
);

// @route   DELETE /api/tasks/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  })
);

module.exports = router;
