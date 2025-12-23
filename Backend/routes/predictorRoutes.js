import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   POST /api/predictor/predict
// @desc    Predict colleges based on CET rank
// @access  Public (can be made private)
router.post('/predict', [
  body('rank').isInt({ min: 1 }).withMessage('Valid CET rank is required'),
  body('category').isIn(['General', 'OBC', 'SC', 'ST', 'EWS']).withMessage('Valid category is required'),
  body('course').optional(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { rank, category, course } = req.body;
  const userId = req.user?.id || null;

  console.log(`[${req.id || 'unknown'}] [Predictor] Received prediction request:`, { rank, category, course, userId });

  // First, get the latest year for this category
  const [yearResult] = await pool.execute(
    'SELECT MAX(year) as max_year FROM cutoff_data WHERE category = ?',
    [category]
  );
  
  const latestYear = yearResult[0]?.max_year;
  
  if (!latestYear) {
    console.log(`[Predictor] No cutoff data found for category: ${category}`);
    return res.json({
      success: true,
      predictions: [],
      message: `No cutoff data found for category: ${category}. Please try a different category or ensure data is loaded.`,
      query: {
        rank,
        category,
        course: course || null
      }
    });
  }

  console.log(`[${req.id || 'unknown'}] [Predictor] Using cutoff data from year: ${latestYear}`);

  // Step 1: Get colleges that have cutoff data for the specified category
  let collegeQuery = `
    SELECT DISTINCT cd.college_id
    FROM cutoff_data cd
    WHERE cd.category = ? AND cd.year = ?
  `;
  
  const collegeParams = [category, latestYear];
  
  if (course) {
    collegeQuery = `
      SELECT DISTINCT cd.college_id
      FROM cutoff_data cd
      JOIN courses co ON cd.course_id = co.id
      WHERE cd.category = ? AND cd.year = ? AND co.course_name LIKE ?
    `;
    collegeParams.push(`%${course}%`);
  }
  
  const [collegesWithCutoff] = await pool.execute(collegeQuery, collegeParams);
  const collegeIds = collegesWithCutoff.map(row => row.college_id);
  
  if (collegeIds.length === 0) {
    console.log(`[${req.id || 'unknown'}] [Predictor] No colleges found with cutoff data`);
    return res.json({
      success: true,
      predictions: [],
      message: `No cutoff data found for the specified criteria (Category: ${category}${course ? ', Course: ' + course : ''}). Please try different category or course.`,
      query: {
        rank,
        category,
        course: course || null
      }
    });
  }
  
  // Step 2: Get ALL courses for these colleges (not just ones with cutoff data)
  let coursesQuery = `
    SELECT 
      co.id as course_id,
      co.course_name,
      co.fees,
      co.duration,
      co.eligibility,
      co.college_id,
      c.name as college_name,
      c.location,
      c.ranking
    FROM courses co
    JOIN colleges c ON co.college_id = c.id
    WHERE co.college_id IN (${collegeIds.map(() => '?').join(',')})
  `;
  
  const coursesParams = [...collegeIds];
  
  if (course) {
    coursesQuery += ' AND co.course_name LIKE ?';
    coursesParams.push(`%${course}%`);
  }
  
  coursesQuery += ' ORDER BY co.college_id, co.id';
  
  const [allCourses] = await pool.execute(coursesQuery, coursesParams);
  
  // Step 3: Get cutoff data for all courses of these colleges
  let cutoffQuery = `
    SELECT 
      cd.*,
      cd.college_id,
      cd.course_id
    FROM cutoff_data cd
    WHERE cd.college_id IN (${collegeIds.map(() => '?').join(',')})
      AND cd.category = ? AND cd.year = ?
  `;
  
  const cutoffParams = [...collegeIds, category, latestYear];
  
  const [cutoffs] = await pool.execute(cutoffQuery, cutoffParams);
  
  // Create a map of cutoff data by college_id and course_id
  const cutoffMap = {};
  cutoffs.forEach(cutoff => {
    const key = `${cutoff.college_id}_${cutoff.course_id}`;
    if (!cutoffMap[key]) {
      cutoffMap[key] = [];
    }
    cutoffMap[key].push(cutoff);
  });
  
  console.log(`[${req.id || 'unknown'}] [Predictor] Found ${allCourses.length} courses across ${collegeIds.length} colleges with ${cutoffs.length} cutoff records`);

  // Helper to calculate admission probability
  const calculateProbability = (userRank, cutoffRow) => {
    const baseRank = cutoffRow.avg_rank || cutoffRow.closing_rank || cutoffRow.max_rank || cutoffRow.opening_rank || 0;

    if (!baseRank || baseRank === 0) {
      return { probability: 0, category_type: 'reach' };
    }

    const rankDiff = userRank - baseRank;
    const rankDiffPercent = baseRank > 0 ? (rankDiff / baseRank) * 100 : 0;

    let probability = 0;
    let category_type = 'reach';

    if (userRank <= (cutoffRow.opening_rank || baseRank * 0.7)) {
      probability = 95;
      category_type = 'safe';
    } else if (userRank <= baseRank || (rankDiffPercent <= 10 && rankDiffPercent >= -10)) {
      probability = 80;
      category_type = 'safe';
    } else if (userRank <= (baseRank * 1.2) || (rankDiffPercent <= 30 && rankDiffPercent > 10)) {
      probability = 65;
      category_type = 'moderate';
    } else if (userRank <= (baseRank * 1.5) || (rankDiffPercent <= 50 && rankDiffPercent > 30)) {
      probability = 45;
      category_type = 'moderate';
    } else if (userRank <= (cutoffRow.closing_rank || cutoffRow.max_rank || baseRank * 2)) {
      probability = 30;
      category_type = 'reach';
    } else {
      probability = 15;
      category_type = 'reach';
    }

    return { probability, category_type };
  };

  // Group predictions by college and include ALL courses (with or without cutoff data)
  const groupedPredictions = {};

  // Process all courses for colleges that have cutoff data
  allCourses.forEach((courseRow) => {
    const collegeId = courseRow.college_id;
    const courseId = courseRow.course_id;
    const cutoffKey = `${collegeId}_${courseId}`;
    const cutoffData = cutoffMap[cutoffKey]?.[0]; // Get the first matching cutoff

    // Initialize college if not exists
    if (!groupedPredictions[collegeId]) {
      groupedPredictions[collegeId] = {
        college_id: collegeId,
        college_name: courseRow.college_name,
        location: courseRow.location,
        ranking: courseRow.ranking,
        availableCourses: [],
      };
    }

    // If cutoff data exists, calculate probability
    if (cutoffData) {
      const closingRank = cutoffData.closing_rank || cutoffData.avg_rank || cutoffData.max_rank || cutoffData.min_rank || 0;
      
      if (closingRank) {
        const { probability, category_type } = calculateProbability(rank, cutoffData);
        
        const courseEntry = {
          id: courseId,
          branch: courseRow.course_name,
          fees_per_year: courseRow.fees ? Number(courseRow.fees) : null,
          closing_rank: closingRank,
          admissionProbability: probability,
          category: category_type,
          duration: courseRow.duration,
          eligibility: courseRow.eligibility,
        };
        
        groupedPredictions[collegeId].availableCourses.push(courseEntry);
      } else {
        // Course exists but no valid cutoff data - still include it with low probability
        const courseEntry = {
          id: courseId,
          branch: courseRow.course_name,
          fees_per_year: courseRow.fees ? Number(courseRow.fees) : null,
          closing_rank: null,
          admissionProbability: 0,
          category: 'reach',
          duration: courseRow.duration,
          eligibility: courseRow.eligibility,
        };
        
        groupedPredictions[collegeId].availableCourses.push(courseEntry);
      }
    } else {
      // Course exists but no cutoff data - include it anyway with null cutoff
      const courseEntry = {
        id: courseId,
        branch: courseRow.course_name,
        fees_per_year: courseRow.fees ? Number(courseRow.fees) : null,
        closing_rank: null,
        admissionProbability: 0,
        category: 'reach',
        duration: courseRow.duration,
        eligibility: courseRow.eligibility,
      };
      
      groupedPredictions[collegeId].availableCourses.push(courseEntry);
    }
  });

  const predictions = Object.values(groupedPredictions).map((college) => {
    // Sort available courses: first by having cutoff data, then by probability desc, then closing rank asc
    college.availableCourses.sort((a, b) => {
      // Courses with cutoff data come first
      const aHasCutoff = a.closing_rank !== null;
      const bHasCutoff = b.closing_rank !== null;
      if (aHasCutoff !== bHasCutoff) {
        return bHasCutoff ? 1 : -1;
      }
      
      // If both have cutoff data, sort by probability
      if (aHasCutoff && bHasCutoff) {
        if (b.admissionProbability !== a.admissionProbability) {
          return b.admissionProbability - a.admissionProbability;
        }
        return (a.closing_rank || Number.MAX_SAFE_INTEGER) - (b.closing_rank || Number.MAX_SAFE_INTEGER);
      }
      
      // If neither has cutoff data, sort alphabetically
      return a.branch.localeCompare(b.branch);
    });

    // Default course is the first one with cutoff data, or first course if none have cutoff
    const defaultCourseId = college.availableCourses.find(c => c.closing_rank !== null)?.id 
      || college.availableCourses[0]?.id 
      || null;

    return {
      ...college,
      defaultCourseId,
    };
  });

  // Sort colleges by their best course probability then cutoff
  predictions.sort((a, b) => {
    const aTop = a.availableCourses[0];
    const bTop = b.availableCourses[0];

    if (bTop?.admissionProbability !== aTop?.admissionProbability) {
      return (bTop?.admissionProbability || 0) - (aTop?.admissionProbability || 0);
    }

    return (aTop?.closing_rank || Number.MAX_SAFE_INTEGER) - (bTop?.closing_rank || Number.MAX_SAFE_INTEGER);
  });

  console.log(`[${req.id || 'unknown'}] [Predictor] Generated ${predictions.length} grouped predictions`);

  // Save prediction if user is logged in
  if (userId) {
    try {
      await pool.execute(
        'INSERT INTO rank_predictions (user_id, `rank`, category, course_preference, results) VALUES (?, ?, ?, ?, ?)',
        [userId, rank, category, course || null, JSON.stringify(predictions)]
      );
      console.log(`[Predictor] Saved prediction history for user ${userId}`);
    } catch (error) {
      console.error(`[Predictor] Error saving prediction history:`, error.message);
      // Don't fail the request if history save fails
    }
  }

  res.json({
    success: true,
    predictions,
    query: {
      rank,
      category,
      course: course || null
    },
    message: predictions.length > 0 
      ? `Found ${predictions.length} college predictions for rank ${rank} (${category})`
      : 'No predictions found'
  });
}));

// @route   GET /api/predictor/history
// @desc    Get user's prediction history
// @access  Private
router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const [predictions] = await pool.execute(
    `SELECT id, \`rank\`, category, course_preference, results, created_at 
     FROM rank_predictions 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  // Parse JSON results safely
  const formattedPredictions = predictions.map(pred => {
    try {
      return {
        ...pred,
        results: pred.results ? JSON.parse(pred.results) : []
      };
    } catch (error) {
      return {
        ...pred,
        results: []
      };
    }
  });

  res.json({
    success: true,
    predictions: formattedPredictions
  });
}));

// @route   GET /api/predictor/history/:id
// @desc    Get a specific prediction by ID
// @access  Private
router.get('/history/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [predictions] = await pool.execute(
    'SELECT * FROM rank_predictions WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (predictions.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Prediction not found'
    });
  }

  const prediction = predictions[0];
  
  // Safely parse JSON results
  try {
    prediction.results = JSON.parse(prediction.results);
  } catch (error) {
    console.error(`[Predictor] Error parsing prediction results for ID ${id}:`, error);
    prediction.results = [];
  }

  res.json({
    success: true,
    prediction
  });
}));

export default router;

