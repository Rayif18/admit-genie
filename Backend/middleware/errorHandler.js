// Centralized error handling middleware

export const errorHandler = (err, req, res, next) => {
  const requestId = req.id || 'unknown';
  console.error(`[${requestId}] Error:`, {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name
  });

  // Default error
  let error = { ...err };
  error.message = err.message;

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate entry. This record already exists.';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Referenced record does not exist.';
    error = { message, statusCode: 400 };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token.';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired.';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    requestId: requestId,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

// Async handler wrapper to catch errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

