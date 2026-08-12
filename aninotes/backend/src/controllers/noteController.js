import * as noteService from '../services/noteService.js';
import logger from '../utils/logger.js';

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await noteService.createNote({ title, content, userId: req.user._id });

    logger.info(`Note created (id: ${note._id}) by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    logger.error(`Create note failed: ${error.message}`);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Something went wrong while creating the note',
    });
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await noteService.getNotesByUser(req.user._id);

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    logger.error(`Fetch notes failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching notes',
    });
  }
};

export const getNote = async (req, res) => {
  try {
    const note = await noteService.getNoteById(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    logger.warn(`Fetch note failed (id: ${req.params.id}): ${error.message}`);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Something went wrong while fetching the note',
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.user._id, req.body);

    logger.info(`Note updated (id: ${note._id}) by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    logger.warn(`Update note failed (id: ${req.params.id}): ${error.message}`);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Something went wrong while updating the note',
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    await noteService.deleteNote(req.params.id, req.user._id);

    logger.info(`Note deleted (id: ${req.params.id}) by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    logger.warn(`Delete note failed (id: ${req.params.id}): ${error.message}`);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Something went wrong while deleting the note',
    });
  }
};
