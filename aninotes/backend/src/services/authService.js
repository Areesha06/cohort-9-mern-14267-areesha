import User from '../models/User.js';

export const createUser = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409; // 409 = Conflict
    throw error;
  }

  const user = await User.create({ username, email, password });
  return user;
};
