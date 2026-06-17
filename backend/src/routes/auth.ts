// src/routes/auth.ts
import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected route — note the cast needed because Express types don't
// know about our AuthRequest extension
router.get('/me', authenticate as never, getMe as never);

export default router;
