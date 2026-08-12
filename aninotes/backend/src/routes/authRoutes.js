import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = Router();

router.post('/register', registerValidator, validateRequest, registerUser);
router.post('/login', loginValidator, validateRequest, loginUser);

export default router;
