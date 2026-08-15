import User from '../models/User.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';
import AppError from '../utils/AppError.js';

const DUMMY_PASSWORD_HASH =
  '$2b$10$rY8d.Gxs/rCnGfNwr/3nJefvOJ0cKoiPIYTtY5OknglJPfKGljqk6';

export const createUser = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const user = await User.create({ username, email, password });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({ id: user._id });

  return { user, token };
};
