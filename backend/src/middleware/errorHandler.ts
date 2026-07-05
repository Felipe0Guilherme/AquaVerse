// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

// ⚠️ Ordem original dos parâmetros: (statusCode, message)
// Os controllers existentes chamam: new AppError(400, 'mensagem')
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
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

  if (!isOperational) {
    console.error('[Unhandled error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error.',
  });
}