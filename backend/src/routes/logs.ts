// src/routes/logs.ts
import { Router } from 'express';
import {
  getLogs,
  getLogById,
  createLog,
  updateLog,
  deleteLog,
  getStats,
} from '../controllers/logsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All log routes require authentication
router.use(authenticate as never);

// Stats endpoint — MUST come before /:id to avoid being caught as an id
router.get('/stats', getStats as never);

router.get('/',       getLogs as never);
router.get('/:id',    getLogById as never);
router.post('/',      createLog as never);
router.patch('/:id',  updateLog as never);
router.delete('/:id', deleteLog as never);

export default router;
