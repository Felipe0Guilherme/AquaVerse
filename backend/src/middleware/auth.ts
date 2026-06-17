// src/middleware/auth.ts
// ============================================================
// JWT authentication middleware.
//
// Strategy: HttpOnly cookie (preferred for SPAs — immune to XSS)
// with a fallback to the Authorization Bearer header so the API
// stays usable from tools like Postman / curl.
//
// Flow:
//   1. Extract token from cookie or Authorization header
//   2. Verify signature + expiry with jsonwebtoken
//   3. Attach the decoded payload to req.user
//   4. Call next() or respond with 401
// ============================================================

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthRequest, JwtPayload } from '../types';

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // 1. Try cookie first (most secure for browser clients)
    const tokenFromCookie: string | undefined = req.cookies?.access_token;

    // 2. Fallback: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
      authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    const token = tokenFromCookie ?? tokenFromHeader;

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. No token provided.',
      });
      return;
    }

    // 3. Verify and decode
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // 4. Attach to request for downstream handlers
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Session expired. Please sign in again.',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
      return;
    }

    // Unexpected error — pass to global error handler
    next(error);
  }
}
