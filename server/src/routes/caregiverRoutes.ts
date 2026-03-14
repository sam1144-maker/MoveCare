import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { saveCaregiver, getMyCaregiver, getPatientCaregiver } from '../controllers/caregiverController';

const router = Router();

// Patient saves/updates their caregiver
router.post('/save', authenticate, saveCaregiver);

// Patient fetches their own caregiver
router.get('/mine', authenticate, getMyCaregiver);

// Doctor fetches a specific patient's caregiver
router.get('/patient/:patientId', authenticate, getPatientCaregiver);

export default router;
