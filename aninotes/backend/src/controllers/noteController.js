import * as noteService from '../services/noteService.js';
import logger from '../utils/logger.js';

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await noteService.createNote({ title, content, userId: req.user._id });

    logger.info({ noteId: note._id, userId: req.user._id }, 'Note created');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    logger.error(`Create note failed: ${error.message}`);
    const statusCode = error.statusCode || 500;
    const message =
        statusCode === 500
        ? 'Something went wrong while creating the note'
        : error.message;
    res.status(statusCode).json({
        success: false,
        message,
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
    logger.error(`Get note failed: ${error.message}`);
    const statusCode = error.statusCode || 500;
    const message =
        statusCode === 500
        ? 'Something went wrong while fetching the note'
        : error.message;
    res.status(statusCode).json({
        success: false,
        message,
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
    logger.error(`Get note failed: ${error.message}`);

    const statusCode = error.statusCode || 500;
    const message =
        statusCode === 500
        ? 'Something went wrong while fetching the note'
        : error.message;

    res.status(statusCode).json({
        success: false,
        message,
    });
    }
};

export const updateNote = async (req, res) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.user._id, req.body);

    logger.info({ noteId: note._id, userId: req.user._id }, 'Note updated');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    logger.error(`Update note failed: ${error.message}`);

    const statusCode = error.statusCode || 500;
    const message =
        statusCode === 500
        ? 'Something went wrong while updating the note'
        : error.message;

    res.status(statusCode).json({
        success: false,
        message,
    });
    }
};

export const deleteNote = async (req, res) => {
  try {
    await noteService.deleteNote(req.params.id, req.user._id);

    logger.info({ noteId: req.params.id, userId: req.user._id }, 'Note deleted');

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete note failed: ${error.message}`);

    const statusCode = error.statusCode || 500;
    const message =
        statusCode === 500
        ? 'Something went wrong while deleting the note'
        : error.message;

    res.status(statusCode).json({
        success: false,
        message,
    });
    }
};
