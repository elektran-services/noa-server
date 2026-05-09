const logger = require('../config/logger');
const { sendError } = require('../utils/api-response');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.station ? req.station._id : null
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return sendError(
      res,
      400,
      'Validation failed',
      Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      })),
      'VALIDATION_ERROR'
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return sendError(
      res,
      400,
      'Duplicate key error',
      Object.keys(err.keyValue).map(key =>
        `${key} '${err.keyValue[key]}' already exists`
      ).join(', '),
      'DUPLICATE_KEY'
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token', err.message, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired', err.message, 'TOKEN_EXPIRED');
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return sendError(res, 400, 'File upload error', err.message, 'UPLOAD_ERROR');
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  return sendError(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'
  );
};

module.exports = errorHandler; 