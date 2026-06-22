// src/server.ts
import 'dotenv/config'; 
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import usersRoutes from './routes/users';
import authRoutes from './routes/auth';
import logsRoutes from './routes/logs';
import messagesRoutes from './routes/messages';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ── Security & Middlewares ──────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' })); 
app.use(cookieParser(config.cookie.secret));
app.use(compression());

// ── Rate limiting ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/logs', apiLimiter, logsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', apiLimiter, messagesRoutes);

// ── 404 & Error Handler ───────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

app.use(errorHandler);


app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🐠 AquaMonitor API                     ║
  ║   Listening on: http://localhost:${config.port}   ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;