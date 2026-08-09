import { createUser } from '../services/authService.js';
import logger from '../utils/logger.js';

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await createUser({ username, email, password });

    logger.info(`New user registered: ${user.email}`);

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
    logger.error(`Registration failed: ${error.message}`);

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Something went wrong during registration',
    });
  }
};
