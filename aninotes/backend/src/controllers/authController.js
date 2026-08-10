import { createUser } from '../services/authService.js';
import logger from '../utils/logger.js';

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await createUser({ username, email, password });

    logger.info({ userId: user._id }, 'New user registered');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error({ errorCode: error.code, statusCode: error.statusCode },'Registration failed');

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: 
        statusCode >= 500
          ? 'Something went wrong during registration'
          : error.message,
    });
  }
};
