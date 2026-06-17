// src/types/index.ts
// ============================================================
// Shared TypeScript types across the backend.
// Keeping types in one place makes refactoring painless and
// serves as living documentation of the data model.
// ============================================================

import { Request } from 'express';

// ── Database entity shapes ──────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Aquarium {
  id: string;
  user_id: string;
  name: string;
  volume_l: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AquariumLog {
  id: string;
  aquarium_id: string;
  user_id: string;
  ph: number | null;
  ammonia_ppm: number | null;
  nitrite_ppm: number | null;
  nitrate_ppm: number | null;
  temperature_c: number | null;
  notes: string | null;
  measured_at: string;
  created_at: string;
}

// ── JWT payload stored in the token ────────────────────────

export interface JwtPayload {
  sub: string;       // user UUID
  email: string;
  iat?: number;
  exp?: number;
}

// ── Augmented Express Request (after auth middleware) ───────

export interface AuthRequest extends Request {
  user: JwtPayload;
}

// ── API response envelope ───────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
