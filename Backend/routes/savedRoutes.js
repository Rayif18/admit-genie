import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   POST /api/saved
// @desc    Save a college
// @access  Private
router.post('/', authenticate, [
  body('college_id').isInt().withMessage('College ID is required'),
  body('course_id').optional().isInt(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { college_id, course_id, notes } = req.body;

  // Check if already saved
  const [existing] = await pool.execute(
    'SELECT id FROM saved_colleges WHERE user_id = ? AND college_id = ? AND (course_id = ? OR (course_id IS NULL AND ? IS NULL))',
    [req.user.id, college_id, course_id || null, course_id || null]
  );

  if (existing.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'College already saved'
    });
  }

  const [result] = await pool.execute(
    'INSERT INTO saved_colleges (user_id, college_id, course_id, notes) VALUES (?, ?, ?, ?)',
    [req.user.id, college_id, course_id || null, notes || null]
  );

  const [saved] = await pool.execute(
    `SELECT 
      sc.*,
      c.name as college_name,
      c.location,
      co.course_name
    FROM saved_colleges sc
    JOIN colleges c ON sc.college_id = c.id
    LEFT JOIN courses co ON sc.course_id = co.id
    WHERE sc.id = ?`,
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'College saved successfully',
    saved: saved[0]
  });
}));

// @route   GET /api/saved
// @desc    Get user's saved colleges
// @access  Private
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const [saved] = await pool.execute(
    `SELECT 
      sc.*,
      c.name as college_name,
      c.location,
      c.ranking,
      co.course_name,
      co.fees
    FROM saved_colleges sc
    JOIN colleges c ON sc.college_id = c.id
    LEFT JOIN courses co ON sc.course_id = co.id
    WHERE sc.user_id = ?
    ORDER BY sc.created_at DESC`,
    [req.user.id]
  );

  res.json({
    success: true,
    saved
  });
}));

// @route   DELETE /api/saved/:id
// @desc    Remove a saved college
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify ownership
  const [saved] = await pool.execute(
    'SELECT id FROM saved_colleges WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (saved.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Saved college not found'
    });
  }

  await pool.execute('DELETE FROM saved_colleges WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'College removed from saved list'
  });
}));

export default router;

