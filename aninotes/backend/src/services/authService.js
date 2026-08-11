import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

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
    if (error.code === 11000) {
      error.statusCode = 409;
    }

    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  // Explicitly include the password field since the schema hides it by default.
  const user = await User.findOne({ email }).select('+password');

  // Use the SAME generic error for "no user" and "wrong password" so we
  // never leak which emails are registered.
  if (!user) {
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
};
