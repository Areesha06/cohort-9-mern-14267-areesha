import Note from '../models/Note.js';
import AppError from '../utils/AppError.js';
import escapeRegex from '../utils/escapeRegex.js';

export const createNote = async ({ title, content, userId }) => {
  const note = await Note.create({ title, content, user: userId });
  return note;
};

export const getNotesByUser = async (userId, search) => {
  const query = { user: userId };

  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [{ title: regex }, { content: regex }];
  }

  const notes = await Note.find(query).sort({ createdAt: -1 });
  return notes;
};

export const getNoteById = async (noteId, userId) => {
  const note = await Note.findOne({ _id: noteId, user: userId });

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  return note;
};

export const updateNote = async (noteId, userId, updates) => {
  const allowedUpdates = {};
  if (updates.title !== undefined) allowedUpdates.title = updates.title;
  if (updates.content !== undefined) allowedUpdates.content = updates.content;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, user: userId },
    allowedUpdates,
    { new: true, runValidators: true }
  );

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  return note;
};

export const deleteNote = async (noteId, userId) => {
  const note = await Note.findOneAndDelete({ _id: noteId, user: userId });

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  return note;
};
