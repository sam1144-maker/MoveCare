import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { extractImage, generateForm, saveRecord, getRecords, getAllRecords } from '../controllers/recordsController';

const router = Router();

router.post('/extract-image', authenticate, extractImage);
router.post('/generate-form', authenticate, generateForm);
router.post('/save', authenticate, saveRecord);
router.get('/all', authenticate, getAllRecords);
router.get('/:patientId', authenticate, getRecords);

export default router;
