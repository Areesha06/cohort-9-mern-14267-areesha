import { body, param, query } from 'express-validator';

export const createNoteValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title must be 150 characters or fewer'),

  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
];

export const updateNoteValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 150 }).withMessage('Title must be 150 characters or fewer'),

  body('content')
    .optional()
    .trim()
    .notEmpty().withMessage('Content cannot be empty'),
];

export const noteIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid note ID'),
];

export const searchNotesValidator = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search term must be less than 100 characters'),
];
