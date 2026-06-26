// src/routes/gamification.ts
import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { getAllXp, feedFish, addXp } from '../controllers/gamificationController';

const router = Router();

router.get('/xp',       getAllXp);
router.post('/feed',    authenticate as RequestHandler, feedFish);
router.post('/xp/add',  authenticate as RequestHandler, addXp);

export default router;
