// src/routes/admin.ts
import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { getShuffleSeed, triggerReshuffle } from '../controllers/adminController';

const router = Router();

// Pública — todos os clientes fazem polling desse endpoint
router.get('/shuffle-seed', getShuffleSeed);

// Protegida — só o admin pode acionar (controller valida o email)
router.post('/reshuffle', authenticate as RequestHandler, triggerReshuffle);

export default router;
