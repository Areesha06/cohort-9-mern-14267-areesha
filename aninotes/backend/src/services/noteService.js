import Note from '../models/Note.js';

export const createNote = async ({ title, content, userId }) => {
  const note = await Note.create({ title, content, user: userId });
  return note;
};

export const getNotesByUser = async (userId) => {
  const notes = await Note.find({ user: userId }).sort({ createdAt: -1 });
  return notes;
};

export const getNoteById = async (noteId, userId) => {
  const note = await Note.findOne({ _id: noteId, user: userId });

  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
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
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  return note;
};

export const deleteNote = async (noteId, userId) => {
  const note = await Note.findOneAndDelete({ _id: noteId, user: userId });

  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  return note;
};
