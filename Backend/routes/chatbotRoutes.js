import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import llmService from '../services/llmService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   POST /api/chatbot/query
// @desc    Send query to chatbot
// @access  Public (optional auth)
router.post('/query', [
  body('query').trim().notEmpty().withMessage('Query is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { query } = req.body;
  
  // Try to get user ID from token if present (optional authentication)
  let userId = null;
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const jwt = (await import('jsonwebtoken')).default;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [decoded.userId]);
      if (users.length > 0) {
        userId = users[0].id;
      }
    }
  } catch (error) {
    // Token invalid or not present, continue as anonymous user
    userId = null;
  }

  // Build database context for the LLM
  const dbContext = {};

  // Extract keywords from query for context
  const lowerQuery = query.toLowerCase();
  
  // Get relevant colleges if query mentions colleges
  // Prioritize Mangalore/Udupi region colleges if mentioned
  if (lowerQuery.includes('college') || lowerQuery.includes('institute') || lowerQuery.includes('mangalore') || lowerQuery.includes('udupi') || lowerQuery.includes('karnataka')) {
    let collegeQuery = 'SELECT id, name, location, ranking, description FROM colleges WHERE 1=1';
    const collegeParams = [];
    
    // If Mangalore/Udupi mentioned, prioritize those
    if (lowerQuery.includes('mangalore') || lowerQuery.includes('udupi') || lowerQuery.includes('coastal')) {
      collegeQuery += ' AND (location LIKE ? OR city LIKE ?)';
      collegeParams.push('%Mangalore%', '%Mangalore%');
      collegeQuery += ' ORDER BY ranking LIMIT 15';
    } else {
      collegeQuery += ' ORDER BY ranking LIMIT 10';
    }
    
    const [colleges] = await pool.execute(collegeQuery, collegeParams);
    dbContext.colleges = colleges;
  }

  // Get relevant courses if query mentions courses
  if (lowerQuery.includes('course') || lowerQuery.includes('program') || lowerQuery.includes('engineering')) {
    const [courses] = await pool.execute(
      `SELECT c.id, c.course_name, c.fees, c.duration, cl.name as college_name 
       FROM courses c 
       JOIN colleges cl ON c.college_id = cl.id 
       LIMIT 5`
    );
    dbContext.courses = courses;
  }

  // Get exam schedules if query mentions exams or deadlines
  if (lowerQuery.includes('exam') || lowerQuery.includes('deadline') || lowerQuery.includes('schedule')) {
    const [exams] = await pool.execute(
      'SELECT * FROM exam_schedules WHERE exam_date >= CURDATE() ORDER BY exam_date LIMIT 5'
    );
    dbContext.exams = exams;
  }

  // Get admission deadlines if query mentions admission
  if (lowerQuery.includes('admission') || lowerQuery.includes('apply')) {
    const [admissions] = await pool.execute(
      `SELECT a.*, c.name as college_name 
       FROM admissions a 
       JOIN colleges c ON a.college_id = c.id 
       WHERE a.deadline >= CURDATE() 
       ORDER BY a.deadline 
       LIMIT 5`
    );
    dbContext.admissions = admissions;
  }

  // Call LLM service
  let response;
  try {
    response = await llmService.callLLM(query, dbContext);
  } catch (error) {
    console.error('LLM Service Error:', error);
    response = llmService.getFallbackResponse(query);
  }

  // Save chat history if user is logged in
  if (userId) {
    await pool.execute(
      'INSERT INTO chat_history (user_id, query, response) VALUES (?, ?, ?)',
      [userId, query, response]
    );
  } else {
    // Save as anonymous chat
    await pool.execute(
      'INSERT INTO chat_history (query, response) VALUES (?, ?)',
      [query, response]
    );
  }

  res.json({
    success: true,
    response,
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/chatbot/history
// @desc    Get user's chat history
// @access  Private
router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // MySQL requires LIMIT and OFFSET to be integers, not parameters
  const [chats] = await pool.execute(
    `SELECT id, query, response, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`,
    [req.user.id]
  );

  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM chat_history WHERE user_id = ?',
    [req.user.id]
  );

  res.json({
    success: true,
    chats,
    pagination: {
      page,
      limit,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    }
  });
}));

// @route   DELETE /api/chatbot/history/:id
// @desc    Delete a chat history entry
// @access  Private
router.delete('/history/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify ownership
  const [chats] = await pool.execute(
    'SELECT id FROM chat_history WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (chats.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Chat history not found'
    });
  }

  await pool.execute('DELETE FROM chat_history WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Chat history deleted successfully'
  });
}));

export default router;

