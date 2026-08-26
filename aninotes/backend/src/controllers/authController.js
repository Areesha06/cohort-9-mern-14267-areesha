import { createUser, loginUser as loginUserService } from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

export const registerUser = asyncHandler(async (req, res) => {
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
});

export const loginUser = asyncHandler(async (req, res) => {
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
      createdAt: user.createdAt,
    },
  });
});

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved successfully',
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};
