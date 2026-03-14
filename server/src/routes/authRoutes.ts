import { Router } from 'express';
import { register, login, googleAuth, getAllPatients, refreshToken } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/refresh', refreshToken);
router.get('/patients', authenticate, getAllPatients);

export default router;
