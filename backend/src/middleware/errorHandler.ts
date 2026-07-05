// src/middleware/errorHandler.ts
// ============================================================
// Global error handler middleware for Express.
// Must be registered LAST in the middleware chain (after all routes).
// ============================================================

import { Request, Response, NextFunction } from 'express';

// Typed application error — lets controllers throw structured errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = (err as AppError).statusCode ?? 500;
  const isOperational = (err as AppError).isOperational ?? false;

  // Log unexpected (non-operational) errors for debugging
  if (!isOperational) {
    console.error('[Unhandled error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error.',
  });
}