import { body } from 'express-validator';

export const registerValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
<<<<<<< HEAD
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  .custom((password) => {
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new Error('Password must not exceed 72 bytes');
    }

    return true;
  }),
=======
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .custom((password) => {
      if (Buffer.byteLength(password, 'utf8') > 72) {
        throw new Error('Password must not exceed 72 bytes');
      }

      return true;
    }),
>>>>>>> fc5f822 (feat: implement user login with JWT authentication)
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];