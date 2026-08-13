import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Auth failed: missing or malformed Authorization header');
    throw new AppError('Not authorized, no token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Auth failed: token missing after Bearer prefix');
    throw new AppError('Not authorized, no token provided', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (verifyError) {
    logger.warn(`Auth failed: token verification error — ${verifyError.message}`);
    throw new AppError('Not authorized, invalid or expired token', 401);
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    logger.warn(`Auth failed: user from token no longer exists (id: ${decoded.id})`);
    throw new AppError('Not authorized, user no longer exists', 401);
  }

  req.user = user;

  next();
});

export default protect;
