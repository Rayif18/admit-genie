import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { generateToken } from '../utils/jwt.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, cet_rank, category } = req.body;

  // Check if user already exists
  const [existingUsers] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, cet_rank, category) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, cet_rank || null, category || 'General']
  );

  // Generate token
  const token = generateToken(result.insertId);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: result.insertId,
      name,
      email,
      cet_rank: cet_rank || null,
      category: category || 'General'
    }
  });
}));

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user
  const [users] = await pool.execute(
    'SELECT id, name, email, password, cet_rank, category FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const user = users[0];

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate token
  const token = generateToken(user.id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      cet_rank: user.cet_rank,
      category: user.category
    }
  });
}));

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const [users] = await pool.execute(
    'SELECT id, name, email, cet_rank, category, preferences, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user: users[0]
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('cet_rank').optional().isInt({ min: 1 }).withMessage('CET rank must be a positive integer'),
  body('category').optional().isIn(['General', 'OBC', 'SC', 'ST', 'EWS']).withMessage('Invalid category'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, cet_rank, category, preferences } = req.body;
  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (email) {
    // Check if email is already taken by another user
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    updates.push('email = ?');
    values.push(email);
  }
  if (cet_rank !== undefined) {
    updates.push('cet_rank = ?');
    values.push(cet_rank);
  }
  if (category) {
    updates.push('category = ?');
    values.push(category);
  }
  if (preferences !== undefined) {
    updates.push('preferences = ?');
    values.push(JSON.stringify(preferences));
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  values.push(req.user.id);

  await pool.execute(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Fetch updated user
  const [users] = await pool.execute(
    'SELECT id, name, email, cet_rank, category, preferences FROM users WHERE id = ?',
    [req.user.id]
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: users[0]
  });
}));

export default router;

