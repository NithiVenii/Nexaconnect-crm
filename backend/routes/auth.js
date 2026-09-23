const express = require('express');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { protect } = require('../middleware/auth');

const router = express.Router();

const runValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array().map((e) => e.msg).join(', '));
    error.statusCode = 400;
    throw error;
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user (defaults to 'employee' role)
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  asyncHandler(async (req, res) => {
    runValidation(req);
    const { name, email, password, role, designation, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('An account with this email already exists');
    }

    // Only allow 'admin' role assignment if explicitly requested AND no admin exists yet
    // (first registered user can become admin to bootstrap the system).
    const adminCount = await User.countDocuments({ role: 'admin' });
    const assignedRole = adminCount === 0 ? 'admin' : role === 'admin' ? 'employee' : 'employee';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      designation,
      phone,
    });

    sendEmail({
      to: user.email,
      subject: 'Welcome to NexaConnect CRM',
      html: `<p>Hi ${user.name},</p><p>Your NexaConnect account has been created successfully as a${
        user.role === 'admin' ? 'n' : ''
      } <b>${user.role}</b>.</p>`,
    }).catch((e) => console.error('Email error:', e.message));

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  })
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  asyncHandler(async (req, res) => {
    runValidation(req);
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('Your account has been deactivated. Contact an administrator.');
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  })
);

// @route   GET /api/auth/me
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user.toSafeObject() });
  })
);

// @route   POST /api/auth/logout
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
