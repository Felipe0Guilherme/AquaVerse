// src/server.ts
// ============================================================
// AquaMonitor API — Entry Point
//
// Responsibilities:
//   - Load environment variables
//   - Configure Express with security middleware
//   - Mount routers
//   - Start listening
// ============================================================

import 'dotenv/config'; // Must be first import
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import serverless from 'serverless-http'; // Importe isto
import usersRoutes from './routes/users';

import { config } from './config/env';
import authRoutes from './routes/auth';
import logsRoutes from './routes/logs';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ── Security headers (helmet sets ~15 headers automatically) ─
app.use(helmet());




// ── CORS ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true, // Required for cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Em vez de app.listen(3000, ...), você faz:
export const handler = serverless(app);

// ── Body parsing & cookies ────────────────────────────────────
app.use(express.json({ limit: '10kb' }));  // Prevent large payload attacks
app.use(cookieParser(config.cookie.secret));
app.use(compression());

// ── Rate limiting ─────────────────────────────────────────────
// Stricter limit on auth endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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

// ── Health check (no auth, no rate limit) ────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/logs', apiLimiter, logsRoutes);

// Logo abaixo do app.use('/api/logs', ...):
app.use('/api/users', usersRoutes);


// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────────────
// Must be registered AFTER all routes
app.use(errorHandler);




// ── Start ─────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🐠 AquaMonitor API                     ║
  ║   Environment : ${config.nodeEnv.padEnd(22)} ║
  ║   Listening on: http://localhost:${config.port}   ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
