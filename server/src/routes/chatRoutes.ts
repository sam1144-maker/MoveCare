import { Router } from 'express';
import { processChat } from '../controllers/chatController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Protect the chat route using the existing JWT middleware
router.post('/', authenticate, processChat);

export default router;
