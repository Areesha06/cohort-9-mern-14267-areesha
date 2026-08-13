import { Router } from 'express';
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import {
  createNoteValidator,
  updateNoteValidator,
  noteIdValidator,
} from '../validators/noteValidator.js';
import validateRequest from '../middlewares/validateRequest.js';
import protect from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/', createNoteValidator, validateRequest, createNote);
router.get('/', getNotes);
router.get('/:id', noteIdValidator, validateRequest, getNote);
router.put('/:id', noteIdValidator, updateNoteValidator, validateRequest, updateNote);
router.delete('/:id', noteIdValidator, validateRequest, deleteNote);

export default router;
