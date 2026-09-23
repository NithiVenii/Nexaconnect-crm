const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users  (admin only - list all employees/admins)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, count: users.length, data: users });
  })
);

// @route   PUT /api/users/profile  (self - update own profile)
router.put(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const { name, phone, designation, avatar } = req.body;
    const user = await require('../models/User').findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (designation !== undefined) user.designation = designation;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  })
);

// @route   PUT /api/users/settings  (self - theme & notification prefs)
router.put(
  '/settings',
  protect,
  asyncHandler(async (req, res) => {
    const { theme, notificationPrefs } = req.body;
    const user = await User.findById(req.user._id);
    if (theme) user.theme = theme;
    if (notificationPrefs) user.notificationPrefs = { ...user.notificationPrefs, ...notificationPrefs };
    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  })
);

// @route   PUT /api/users/password  (self - change password)
router.put(
  '/password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  })
);

// @route   PUT /api/users/:id/role  (admin only)
router.put(
  '/:id/role',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.role = role;
    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  })
);

// @route   PUT /api/users/:id/status  (admin only - activate/deactivate)
router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  })
);

// @route   DELETE /api/users/:id  (admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
  })
);

module.exports = router;
