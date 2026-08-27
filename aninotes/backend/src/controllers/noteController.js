import * as noteService from '../services/noteService.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

export const createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const note = await noteService.createNote({ title, content, userId: req.user._id });

  logger.info({ noteId: note._id, userId: req.user._id }, 'Note created');

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note,
  });
});

export const getNotes = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const notes = await noteService.getNotesByUser(req.user._id, search);

  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes,
  });
});

export const getNote = asyncHandler(async (req, res) => {
  const note = await noteService.getNoteById(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    data: note,
  });
});

export const updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.params.id, req.user._id, req.body);

  logger.info({ noteId: note._id, userId: req.user._id }, 'Note updated');

  res.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: note,
  });
});

export const deleteNote = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.params.id, req.user._id);

  logger.info({ noteId: req.params.id, userId: req.user._id }, 'Note deleted');

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully',
  });
});
