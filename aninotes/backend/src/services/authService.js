import User from '../models/User.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';

const DUMMY_PASSWORD_HASH =
  '$2b$10$rY8d.Gxs/rCnGfNwr/3nJefvOJ0cKoiPIYTtY5OknglJPfKGljqk6';

export const createUser = async ({ username, email, password }) => {
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({ username, email, password });

    return user;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    if (error.code === 11000) {
      error.statusCode = 409;
    }

    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);

      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({ id: user._id });

    return { user, token };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const controlledError = new Error('Unable to process login');
    controlledError.statusCode = 500;

    throw controlledError;
  }
};
