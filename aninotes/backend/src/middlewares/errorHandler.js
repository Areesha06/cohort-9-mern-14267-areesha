import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let isOperational = err.isOperational === true;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    isOperational = true;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    isOperational = true;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue ?? {})[0];
    message = field ? `${field} already exists` : 'Duplicate value';
    isOperational = true;
  }

  if (statusCode >= 500) {
    logger.error(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        message,
        err,
      },
      'Request failed'
    );
  } else {
    logger.warn(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        message,
      },
      'Request rejected'
    );
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 || !isOperational ? 'Internal Server Error' : message,
  });
};

export default errorHandler;
