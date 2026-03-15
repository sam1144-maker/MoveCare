import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware';
import { getAllPatients, getAllDoctors, getAnalytics } from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.get('/patients', authenticate, isAdmin, getAllPatients);
router.get('/doctors', authenticate, isAdmin, getAllDoctors);
router.get('/analytics', authenticate, isAdmin, getAnalytics);

export default router;
