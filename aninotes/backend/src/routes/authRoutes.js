import { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import validateRequest from '../middlewares/validateRequest.js';
import protect from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', registerValidator, validateRequest, registerUser);
router.post('/login', loginValidator, validateRequest, loginUser);
router.get('/me', protect, getMe);

export default router;
