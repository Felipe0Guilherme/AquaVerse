// src/routes/admin.ts
import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { getShuffleSeed, triggerReshuffle, grantSpecial } from '../controllers/adminController';

const router = Router();

router.get('/shuffle-seed',            getShuffleSeed);
router.post('/reshuffle', authenticate as RequestHandler, triggerReshuffle);
router.post('/grant-special', authenticate as RequestHandler, grantSpecial);

export default router;
