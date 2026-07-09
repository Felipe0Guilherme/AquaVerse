// src/routes/gamification.ts
import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { getStats, feedFish, addXp, dailyBonus, likeFish, unlikeFish, eatFood } from '../controllers/gamificationController';

const router = Router();
const auth = authenticate as RequestHandler;

router.get('/stats',              getStats);
router.post('/feed',         auth, feedFish);
router.post('/xp/add',       auth, addXp);
router.post('/daily',        auth, dailyBonus);
router.post('/like/:username',auth, likeFish);
router.delete('/like/:username',auth, unlikeFish);
router.post('/eat',           auth, eatFood);

export default router;