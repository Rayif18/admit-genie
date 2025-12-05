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

  console.log(`[Predictor] Received prediction request:`, { rank, category, course, userId });

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

  console.log(`[Predictor] Using cutoff data from year: ${latestYear}`);

  // Get cutoff data for the specified category
  let cutoffQuery = `
    SELECT 
      cd.*,
      c.id as college_id,
      c.name as college_name,
      c.location,
      c.ranking,
      co.id as course_id,
      co.course_name,
      co.fees,
      co.duration,
      co.eligibility
    FROM cutoff_data cd
    JOIN colleges c ON cd.college_id = c.id
    JOIN courses co ON cd.course_id = co.id
    WHERE cd.category = ? AND cd.year = ?
  `;

  const params = [category, latestYear];

  if (course) {
    cutoffQuery += ' AND co.course_name LIKE ?';
    params.push(`%${course}%`);
  }

  cutoffQuery += ' ORDER BY cd.avg_rank ASC LIMIT 200';

  console.log(`[Predictor] Executing query with params:`, params);
  
  const [cutoffs] = await pool.execute(cutoffQuery, params);
  
  console.log(`[Predictor] Found ${cutoffs.length} cutoff records`);

  // If no cutoff data found, return empty array with message
  if (!cutoffs || cutoffs.length === 0) {
    console.log(`[Predictor] No cutoff data found for criteria: category=${category}, course=${course || 'any'}, year=${latestYear}`);
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

  // Calculate predictions
  const predictions = cutoffs.map(cutoff => {
    // Use avg_rank as primary, fallback to closing_rank, then max_rank
    const avgRank = cutoff.avg_rank || cutoff.closing_rank || cutoff.max_rank || 0;
    
    if (!avgRank || avgRank === 0) {
      console.warn(`[Predictor] Warning: No valid rank data for college ${cutoff.college_name}, course ${cutoff.course_name}`);
      return null;
    }
    
    const rankDiff = rank - avgRank;
    const rankDiffPercent = avgRank > 0 ? (rankDiff / avgRank) * 100 : 0;

    let probability = 0;
    let category_type = 'reach';

    // Calculate probability based on rank difference
    // Lower rank number = better rank (rank 1 is better than rank 1000)
    if (rank <= (cutoff.opening_rank || avgRank * 0.7)) {
      // User's rank is better than opening rank or 70% of average
      probability = 95;
      category_type = 'safe';
    } else if (rank <= avgRank || (rankDiffPercent <= 10 && rankDiffPercent >= -10)) {
      // User's rank is close to or better than average
      probability = 80;
      category_type = 'safe';
    } else if (rank <= (avgRank * 1.2) || (rankDiffPercent <= 30 && rankDiffPercent > 10)) {
      // User's rank is within 20% of average
      probability = 65;
      category_type = 'moderate';
    } else if (rank <= (avgRank * 1.5) || (rankDiffPercent <= 50 && rankDiffPercent > 30)) {
      // User's rank is within 50% of average
      probability = 45;
      category_type = 'moderate';
    } else if (rank <= (cutoff.closing_rank || cutoff.max_rank || avgRank * 2)) {
      // User's rank is within closing rank range
      probability = 30;
      category_type = 'reach';
    } else {
      // User's rank is worse than closing rank
      probability = 15;
      category_type = 'reach';
    }

    return {
      college_id: cutoff.college_id,
      college_name: cutoff.college_name,
      location: cutoff.location,
      ranking: cutoff.ranking,
      course_id: cutoff.course_id,
      course_name: cutoff.course_name,
      fees: cutoff.fees,
      duration: cutoff.duration,
      eligibility: cutoff.eligibility,
      last_year_cutoff: avgRank,
      opening_rank: cutoff.opening_rank,
      closing_rank: cutoff.closing_rank || cutoff.max_rank,
      probability,
      category: category_type
    };
  }).filter(pred => pred !== null); // Remove any null predictions

  // Sort by probability (highest first), then by avg_rank (lower is better)
  predictions.sort((a, b) => {
    if (b.probability !== a.probability) {
      return b.probability - a.probability;
    }
    return a.last_year_cutoff - b.last_year_cutoff;
  });

  console.log(`[Predictor] Generated ${predictions.length} predictions`);

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
  prediction.results = JSON.parse(prediction.results);

  res.json({
    success: true,
    prediction
  });
}));

export default router;

