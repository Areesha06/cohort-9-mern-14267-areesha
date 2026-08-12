import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Auth failed: missing or malformed Authorization header');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Auth failed: token missing after Bearer prefix');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      logger.warn(`Auth failed: token verification error — ${verifyError.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token',
      });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      logger.warn(`Auth failed: user from token no longer exists (id: ${decoded.id})`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user no longer exists',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    logger.error(`Unexpected error in auth middleware: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Something went wrong during authentication',
    });
  }
};

export default protect;
