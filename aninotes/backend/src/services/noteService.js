import Note from '../models/Note.js';
import logger from '../utils/logger.js';

const handleServiceError = (error, operation) => {
  logger.error({ error }, `${operation} failed`);

  const serviceError = new Error(
    `Unable to ${operation.toLowerCase()}`
  );

  serviceError.statusCode = 500;

  return serviceError;
};

export const createNote = async ({ title, content, userId }) => {
  try {
    const note = await Note.create({
      title,
      content,
      user: userId,
    });

    return note;
  } catch (error) {
    throw handleServiceError(error, 'Create note');
  }
};

export const getNotesByUser = async (userId) => {
  try {
    const notes = await Note.find({ user: userId }).sort({ createdAt: -1 });

    return notes;
  } catch (error) {
    throw handleServiceError(error, 'Fetch notes');
  }
};

export const getNoteById = async (noteId, userId) => {
  try {
    const note = await Note.findOne({
      _id: noteId,
      user: userId,
    });

    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    return note;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw handleServiceError(error, 'Fetch note');
  }
};

export const updateNote = async (noteId, userId, updates) => {
  try {
    const allowedUpdates = {};

    if (updates.title !== undefined) {
      allowedUpdates.title = updates.title;
    }

    if (updates.content !== undefined) {
      allowedUpdates.content = updates.content;
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, user: userId },
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    return note;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw handleServiceError(error, 'Update note');
  }
};

export const deleteNote = async (noteId, userId) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: noteId,
      user: userId,
    });

    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }

    return note;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw handleServiceError(error, 'Delete note');
  }
};
