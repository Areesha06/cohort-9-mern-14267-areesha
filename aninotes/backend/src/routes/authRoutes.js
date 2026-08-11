import { Router } from 'express';
import { registerUser } from '../controllers/authController.js';
import { registerValidator } from '../validators/authValidator.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = Router();

router.post('/register', registerValidator, validateRequest, registerUser);

export default router;
