import express from 'express';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/colleges
// @desc    Get all colleges (public)
// @access  Public
router.get('/colleges', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search;
  const location = req.query.location;

  let query = 'SELECT id, name, location, state, city, accreditation, ranking, description FROM colleges WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM colleges WHERE 1=1';
  const params = [];
  const countParams = [];

  if (search) {
    const searchTerm = `%${search}%`;
    query += ' AND (name LIKE ? OR location LIKE ? OR description LIKE ?)';
    countQuery += ' AND (name LIKE ? OR location LIKE ? OR description LIKE ?)';
    params.push(searchTerm, searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm, searchTerm);
  }

  if (location) {
    const locationTerm = `%${location}%`;
    query += ' AND (location LIKE ? OR city LIKE ? OR state LIKE ?)';
    countQuery += ' AND (location LIKE ? OR city LIKE ? OR state LIKE ?)';
    params.push(locationTerm, locationTerm, locationTerm);
    countParams.push(locationTerm, locationTerm, locationTerm);
  }

  // MySQL doesn't accept LIMIT and OFFSET as parameters in prepared statements
  // They must be in the query string directly
  query += ` ORDER BY ranking ASC, name ASC LIMIT ${limit} OFFSET ${offset}`;

  const [colleges] = await pool.execute(query, params);
  const [countResult] = await pool.execute(countQuery, countParams);

  res.json({
    success: true,
    colleges,
    pagination: {
      page,
      limit,
      total: countResult[0]?.total || 0,
      pages: Math.ceil((countResult[0]?.total || 0) / limit)
    }
  });
}));

// @route   GET /api/colleges/:id
// @desc    Get college details by ID
// @access  Public
router.get('/colleges/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [colleges] = await pool.execute(
    'SELECT * FROM colleges WHERE id = ?',
    [id]
  );

  if (colleges.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'College not found'
    });
  }

  // Get courses for this college
  const [courses] = await pool.execute(
    'SELECT * FROM courses WHERE college_id = ?',
    [id]
  );

  // Get admissions info
  const [admissions] = await pool.execute(
    'SELECT * FROM admissions WHERE college_id = ?',
    [id]
  );

  res.json({
    success: true,
    college: {
      ...colleges[0],
      courses,
      admissions
    }
  });
}));

// @route   GET /api/courses
// @desc    Get all courses (public)
// @access  Public
router.get('/courses', asyncHandler(async (req, res) => {
  const collegeId = req.query.college_id;
  const search = req.query.search;

  let query = `
    SELECT 
      c.*,
      cl.name as college_name,
      cl.location as college_location
    FROM courses c
    JOIN colleges cl ON c.college_id = cl.id
    WHERE 1=1
  `;
  const params = [];

  if (collegeId) {
    query += ' AND c.college_id = ?';
    params.push(collegeId);
  }

  if (search) {
    query += ' AND (c.course_name LIKE ? OR c.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY c.course_name ASC';

  const [courses] = await pool.execute(query, params);

  res.json({
    success: true,
    courses
  });
}));

// @route   GET /api/courses/:id
// @desc    Get course details by ID
// @access  Public
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [courses] = await pool.execute(
    `SELECT 
      c.*,
      cl.name as college_name,
      cl.location as college_location,
      cl.website,
      cl.contact_email,
      cl.contact_phone
    FROM courses c
    JOIN colleges cl ON c.college_id = cl.id
    WHERE c.id = ?`,
    [id]
  );

  if (courses.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Get admission info for this course
  const [admissions] = await pool.execute(
    'SELECT * FROM admissions WHERE course_id = ?',
    [id]
  );

  // Get cutoff data
  const [cutoffs] = await pool.execute(
    'SELECT * FROM cutoff_data WHERE course_id = ? ORDER BY year DESC',
    [id]
  );

  res.json({
    success: true,
    course: {
      ...courses[0],
      admissions: admissions[0],
      cutoffs: cutoffs[0]
    }
  });
}));

// @route   GET /api/exams
// @desc    Get exam schedules (public)
// @access  Public
router.get('/exams', asyncHandler(async (req, res) => {
  const [exams] = await pool.execute(
    'SELECT * FROM exam_schedules ORDER BY exam_date ASC'
  );

  res.json({
    success: true,
    exams
  });
}));

// @route   GET /api/exams/:id
// @desc    Get exam details by ID
// @access  Public
router.get('/exams/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [exams] = await pool.execute(
    'SELECT * FROM exam_schedules WHERE id = ?',
    [id]
  );

  if (exams.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  res.json({
    success: true,
    exam: exams[0]
  });
}));

// @route   GET /api/admissions
// @desc    Get admission information (public)
// @access  Public
router.get('/admissions', asyncHandler(async (req, res) => {
  const collegeId = req.query.college_id;
  const courseId = req.query.course_id;

  let query = `
    SELECT 
      a.*,
      c.name as college_name,
      co.course_name
    FROM admissions a
    LEFT JOIN colleges c ON a.college_id = c.id
    LEFT JOIN courses co ON a.course_id = co.id
    WHERE 1=1
  `;
  const params = [];

  if (collegeId) {
    query += ' AND a.college_id = ?';
    params.push(collegeId);
  }

  if (courseId) {
    query += ' AND a.course_id = ?';
    params.push(courseId);
  }

  query += ' ORDER BY a.deadline ASC';

  const [admissions] = await pool.execute(query, params);

  res.json({
    success: true,
    admissions
  });
}));

// @route   GET /api/cutoffs
// @desc    Get cutoff data (public)
// @access  Public
router.get('/cutoffs', asyncHandler(async (req, res) => {
  const collegeId = req.query.college_id;
  const courseId = req.query.course_id;
  const category = req.query.category;
  const year = req.query.year;

  let query = `
    SELECT 
      cd.*,
      c.name as college_name,
      co.course_name
    FROM cutoff_data cd
    JOIN colleges c ON cd.college_id = c.id
    JOIN courses co ON cd.course_id = co.id
    WHERE 1=1
  `;
  const params = [];

  if (collegeId) {
    query += ' AND cd.college_id = ?';
    params.push(collegeId);
  }

  if (courseId) {
    query += ' AND cd.course_id = ?';
    params.push(courseId);
  }

  if (category) {
    query += ' AND cd.category = ?';
    params.push(category);
  }

  if (year) {
    query += ' AND cd.year = ?';
    params.push(year);
  }

  query += ' ORDER BY cd.year DESC, cd.avg_rank ASC';

  const [cutoffs] = await pool.execute(query, params);

  res.json({
    success: true,
    cutoffs
  });
}));

export default router;

