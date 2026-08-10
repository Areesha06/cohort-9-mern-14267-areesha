import User from '../models/User.js';

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
