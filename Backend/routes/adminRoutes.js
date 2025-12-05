import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { generateAdminToken } from '../utils/jwt.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, password } = req.body;

  const [admins] = await pool.execute(
    'SELECT id, username, password FROM admins WHERE username = ?',
    [username]
  );

  if (admins.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  const admin = admins[0];

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  const token = generateAdminToken(admin.id);

  res.json({
    success: true,
    message: 'Admin login successful',
    token,
    admin: {
      id: admin.id,
      username: admin.username
    }
  });
}));

// ========== COLLEGE CRUD ==========

// @route   POST /api/admin/colleges
// @desc    Create a new college
// @access  Private (Admin)
router.post('/colleges', authenticateAdmin, [
  body('name').notEmpty().withMessage('College name is required'),
  body('location').optional(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, location, state, city, accreditation, ranking, description, placement_info, website, contact_email, contact_phone } = req.body;

  const [result] = await pool.execute(
    `INSERT INTO colleges (name, location, state, city, accreditation, ranking, description, placement_info, website, contact_email, contact_phone) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, location, state, city, accreditation, ranking, description, placement_info, website, contact_email, contact_phone]
  );

  const [colleges] = await pool.execute('SELECT * FROM colleges WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'College created successfully',
    college: colleges[0]
  });
}));

// @route   GET /api/admin/colleges
// @desc    Get all colleges (with pagination)
// @access  Private (Admin)
router.get('/colleges', authenticateAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const [colleges] = await pool.execute(
    'SELECT * FROM colleges ORDER BY id DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM colleges');
  const total = countResult[0].total;

  res.json({
    success: true,
    colleges,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @route   PUT /api/admin/colleges/:id
// @desc    Update a college
// @access  Private (Admin)
router.put('/colleges/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, location, state, city, accreditation, ranking, description, placement_info, website, contact_email, contact_phone } = req.body;

  const updates = [];
  const values = [];

  if (name) { updates.push('name = ?'); values.push(name); }
  if (location !== undefined) { updates.push('location = ?'); values.push(location); }
  if (state !== undefined) { updates.push('state = ?'); values.push(state); }
  if (city !== undefined) { updates.push('city = ?'); values.push(city); }
  if (accreditation !== undefined) { updates.push('accreditation = ?'); values.push(accreditation); }
  if (ranking !== undefined) { updates.push('ranking = ?'); values.push(ranking); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (placement_info !== undefined) { updates.push('placement_info = ?'); values.push(placement_info); }
  if (website !== undefined) { updates.push('website = ?'); values.push(website); }
  if (contact_email !== undefined) { updates.push('contact_email = ?'); values.push(contact_email); }
  if (contact_phone !== undefined) { updates.push('contact_phone = ?'); values.push(contact_phone); }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  values.push(id);

  await pool.execute(`UPDATE colleges SET ${updates.join(', ')} WHERE id = ?`, values);

  const [colleges] = await pool.execute('SELECT * FROM colleges WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'College updated successfully',
    college: colleges[0]
  });
}));

// @route   DELETE /api/admin/colleges/:id
// @desc    Delete a college
// @access  Private (Admin)
router.delete('/colleges/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.execute('DELETE FROM colleges WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'College deleted successfully'
  });
}));

// ========== COURSE CRUD ==========

router.post('/courses', authenticateAdmin, [
  body('college_id').isInt().withMessage('College ID is required'),
  body('course_name').notEmpty().withMessage('Course name is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { college_id, course_name, course_code, duration, eligibility, fees, fees_period, intake, description } = req.body;

  const [result] = await pool.execute(
    `INSERT INTO courses (college_id, course_name, course_code, duration, eligibility, fees, fees_period, intake, description) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [college_id, course_name, course_code, duration, eligibility, fees, fees_period, intake, description]
  );

  const [courses] = await pool.execute('SELECT * FROM courses WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    course: courses[0]
  });
}));

router.get('/courses', authenticateAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const collegeId = req.query.college_id;

  let query = 'SELECT c.*, cl.name as college_name FROM courses c JOIN colleges cl ON c.college_id = cl.id';
  const params = [];

  if (collegeId) {
    query += ' WHERE c.college_id = ?';
    params.push(collegeId);
  }

  query += ' ORDER BY c.id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [courses] = await pool.execute(query, params);

  res.json({
    success: true,
    courses
  });
}));

router.put('/courses/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { course_name, course_code, duration, eligibility, fees, fees_period, intake, description } = req.body;

  const updates = [];
  const values = [];

  if (course_name) { updates.push('course_name = ?'); values.push(course_name); }
  if (course_code !== undefined) { updates.push('course_code = ?'); values.push(course_code); }
  if (duration !== undefined) { updates.push('duration = ?'); values.push(duration); }
  if (eligibility !== undefined) { updates.push('eligibility = ?'); values.push(eligibility); }
  if (fees !== undefined) { updates.push('fees = ?'); values.push(fees); }
  if (fees_period !== undefined) { updates.push('fees_period = ?'); values.push(fees_period); }
  if (intake !== undefined) { updates.push('intake = ?'); values.push(intake); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  values.push(id);
  await pool.execute(`UPDATE courses SET ${updates.join(', ')} WHERE id = ?`, values);

  const [courses] = await pool.execute('SELECT * FROM courses WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Course updated successfully',
    course: courses[0]
  });
}));

router.delete('/courses/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  await pool.execute('DELETE FROM courses WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Course deleted successfully' });
}));

// ========== ADMISSION CRUD ==========

router.post('/admissions', authenticateAdmin, [
  body('college_id').isInt().withMessage('College ID is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { college_id, course_id, deadline, required_exam, application_link, application_fee, admission_process, documents_required } = req.body;

  const [result] = await pool.execute(
    `INSERT INTO admissions (college_id, course_id, deadline, required_exam, application_link, application_fee, admission_process, documents_required) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [college_id, course_id, deadline, required_exam, application_link, application_fee, admission_process, documents_required]
  );

  const [admissions] = await pool.execute('SELECT * FROM admissions WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Admission record created successfully',
    admission: admissions[0]
  });
}));

router.get('/admissions', authenticateAdmin, asyncHandler(async (req, res) => {
  const [admissions] = await pool.execute(
    `SELECT a.*, c.name as college_name, co.course_name 
     FROM admissions a 
     LEFT JOIN colleges c ON a.college_id = c.id 
     LEFT JOIN courses co ON a.course_id = co.id 
     ORDER BY a.id DESC`
  );

  res.json({ success: true, admissions });
}));

router.put('/admissions/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deadline, required_exam, application_link, application_fee, admission_process, documents_required } = req.body;

  const updates = [];
  const values = [];

  if (deadline) { updates.push('deadline = ?'); values.push(deadline); }
  if (required_exam !== undefined) { updates.push('required_exam = ?'); values.push(required_exam); }
  if (application_link !== undefined) { updates.push('application_link = ?'); values.push(application_link); }
  if (application_fee !== undefined) { updates.push('application_fee = ?'); values.push(application_fee); }
  if (admission_process !== undefined) { updates.push('admission_process = ?'); values.push(admission_process); }
  if (documents_required !== undefined) { updates.push('documents_required = ?'); values.push(documents_required); }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  values.push(id);
  await pool.execute(`UPDATE admissions SET ${updates.join(', ')} WHERE id = ?`, values);

  const [admissions] = await pool.execute('SELECT * FROM admissions WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Admission record updated successfully',
    admission: admissions[0]
  });
}));

router.delete('/admissions/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  await pool.execute('DELETE FROM admissions WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Admission record deleted successfully' });
}));

// ========== CUTOFF DATA CRUD ==========

router.post('/cutoffs', authenticateAdmin, [
  body('college_id').isInt().withMessage('College ID is required'),
  body('course_id').isInt().withMessage('Course ID is required'),
  body('category').isIn(['General', 'OBC', 'SC', 'ST', 'EWS']).withMessage('Invalid category'),
  body('year').isInt().withMessage('Year is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank } = req.body;

  const [result] = await pool.execute(
    `INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank]
  );

  const [cutoffs] = await pool.execute('SELECT * FROM cutoff_data WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Cutoff data created successfully',
    cutoff: cutoffs[0]
  });
}));

router.get('/cutoffs', authenticateAdmin, asyncHandler(async (req, res) => {
  const [cutoffs] = await pool.execute(
    `SELECT cd.*, c.name as college_name, co.course_name 
     FROM cutoff_data cd 
     JOIN colleges c ON cd.college_id = c.id 
     JOIN courses co ON cd.course_id = co.id 
     ORDER BY cd.year DESC, cd.id DESC`
  );

  res.json({ success: true, cutoffs });
}));

router.put('/cutoffs/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { min_rank, max_rank, avg_rank, opening_rank, closing_rank } = req.body;

  const updates = [];
  const values = [];

  if (min_rank !== undefined) { updates.push('min_rank = ?'); values.push(min_rank); }
  if (max_rank !== undefined) { updates.push('max_rank = ?'); values.push(max_rank); }
  if (avg_rank !== undefined) { updates.push('avg_rank = ?'); values.push(avg_rank); }
  if (opening_rank !== undefined) { updates.push('opening_rank = ?'); values.push(opening_rank); }
  if (closing_rank !== undefined) { updates.push('closing_rank = ?'); values.push(closing_rank); }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  values.push(id);
  await pool.execute(`UPDATE cutoff_data SET ${updates.join(', ')} WHERE id = ?`, values);

  const [cutoffs] = await pool.execute('SELECT * FROM cutoff_data WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Cutoff data updated successfully',
    cutoff: cutoffs[0]
  });
}));

router.delete('/cutoffs/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  await pool.execute('DELETE FROM cutoff_data WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Cutoff data deleted successfully' });
}));

// ========== EXAM SCHEDULE CRUD ==========

router.post('/exams', authenticateAdmin, [
  body('exam_name').notEmpty().withMessage('Exam name is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { exam_name, exam_type, registration_start, registration_end, exam_date, result_date, application_link, exam_fee, description } = req.body;

  const [result] = await pool.execute(
    `INSERT INTO exam_schedules (exam_name, exam_type, registration_start, registration_end, exam_date, result_date, application_link, exam_fee, description) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [exam_name, exam_type, registration_start, registration_end, exam_date, result_date, application_link, exam_fee, description]
  );

  const [exams] = await pool.execute('SELECT * FROM exam_schedules WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Exam schedule created successfully',
    exam: exams[0]
  });
}));

router.get('/exams', authenticateAdmin, asyncHandler(async (req, res) => {
  const [exams] = await pool.execute('SELECT * FROM exam_schedules ORDER BY exam_date DESC');

  res.json({ success: true, exams });
}));

router.put('/exams/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { exam_name, exam_type, registration_start, registration_end, exam_date, result_date, application_link, exam_fee, description } = req.body;

  const updates = [];
  const values = [];

  if (exam_name) { updates.push('exam_name = ?'); values.push(exam_name); }
  if (exam_type !== undefined) { updates.push('exam_type = ?'); values.push(exam_type); }
  if (registration_start) { updates.push('registration_start = ?'); values.push(registration_start); }
  if (registration_end) { updates.push('registration_end = ?'); values.push(registration_end); }
  if (exam_date) { updates.push('exam_date = ?'); values.push(exam_date); }
  if (result_date) { updates.push('result_date = ?'); values.push(result_date); }
  if (application_link !== undefined) { updates.push('application_link = ?'); values.push(application_link); }
  if (exam_fee !== undefined) { updates.push('exam_fee = ?'); values.push(exam_fee); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  values.push(id);
  await pool.execute(`UPDATE exam_schedules SET ${updates.join(', ')} WHERE id = ?`, values);

  const [exams] = await pool.execute('SELECT * FROM exam_schedules WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Exam schedule updated successfully',
    exam: exams[0]
  });
}));

router.delete('/exams/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  await pool.execute('DELETE FROM exam_schedules WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Exam schedule deleted successfully' });
}));

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics
// @access  Private (Admin)
router.get('/analytics', authenticateAdmin, asyncHandler(async (req, res) => {
  const [stats] = await Promise.all([
    pool.execute('SELECT COUNT(*) as total FROM users'),
    pool.execute('SELECT COUNT(*) as total FROM colleges'),
    pool.execute('SELECT COUNT(*) as total FROM courses'),
    pool.execute('SELECT COUNT(*) as total FROM chat_history'),
    pool.execute('SELECT COUNT(*) as total FROM rank_predictions'),
  ]);

  const [recentChatsResult] = await pool.execute(
    'SELECT * FROM chat_history ORDER BY timestamp DESC LIMIT 10'
  );

  const [popularQueriesResult] = await pool.execute(
    `SELECT query, COUNT(*) as count 
     FROM chat_history 
     GROUP BY query 
     ORDER BY count DESC 
     LIMIT 10`
  );

  res.json({
    success: true,
    analytics: {
      totalUsers: stats[0][0].total,
      totalColleges: stats[1][0].total,
      totalCourses: stats[2][0].total,
      totalChats: stats[3][0].total,
      totalPredictions: stats[4][0].total,
      recentChats: recentChatsResult[0],
      popularQueries: popularQueriesResult[0]
    }
  });
}));

export default router;

