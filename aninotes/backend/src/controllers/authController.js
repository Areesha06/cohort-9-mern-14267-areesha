import { createUser, loginUser as loginUserService } from '../services/authService.js';
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
    logger.error({ errorCode: error.code, statusCode: error.statusCode }, 'Registration failed');

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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await loginUserService({ email, password });

    logger.info({ userId: user._id }, 'User logged in.');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    logger.warn({ errorCode: error.code, statusCode: error.statusCode }, 'Login failed');

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message:
        statusCode >= 500
          ? 'Something went wrong during login'
          : error.message,
    });
  }
};

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved successfully',
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    },
  });
};
