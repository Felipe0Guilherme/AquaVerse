// src/middleware/errorHandler.ts
// ============================================================
// Centralised error handling middleware.
//
// Express requires 4 parameters for error handlers — the (err)
// signature is what distinguishes them from regular middleware.
//
// Returns consistent JSON envelopes so the frontend can always
// rely on the same error shape regardless of where it originated.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/env';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── Zod validation errors ─────────────────────────────────
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // ── Known operational errors ──────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // ── Unknown / programmer errors ───────────────────────────
  // Never leak stack traces or internal messages in production.
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: config.isProduction
      ? 'An internal server error occurred.'
      : err.message,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}
