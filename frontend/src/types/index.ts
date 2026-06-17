// src/types/index.ts
// ============================================================
// Frontend type definitions — mirrors the backend types so
// TypeScript catches mismatches at compile time.
// ============================================================

// ── Domain models ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Aquarium {
  id: string;
  user_id: string;
  name: string;
  volume_l: number | null;
  description: string | null;
  created_at: string;
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

// ── API payloads ──────────────────────────────────────────────

export type CreateLogPayload = {
  aquarium_id: string;
  ph?: number | null;
  ammonia_ppm?: number | null;
  nitrite_ppm?: number | null;
  nitrate_ppm?: number | null;
  temperature_c?: number | null;
  notes?: string | null;
  measured_at?: string;
};

export type UpdateLogPayload = Partial<Omit<CreateLogPayload, 'aquarium_id'>>;

export interface LogsQueryParams {
  aquarium_id?: string;
  page?: number;
  limit?: number;
  sort?: 'measured_at' | 'created_at';
  order?: 'asc' | 'desc';
  from?: string;
  to?: string;
}

// ── API responses ─────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  chart: Pick<AquariumLog,
    'ph' | 'ammonia_ppm' | 'nitrite_ppm' | 'nitrate_ppm' | 'temperature_c' | 'measured_at'
  >[];
  latest: AquariumLog | null;
  averages: {
    ph: number | null;
    ammonia_ppm: number | null;
    nitrite_ppm: number | null;
    nitrate_ppm: number | null;
    temperature_c: number | null;
  };
}

// ── Alert thresholds (used in dashboard) ─────────────────────

export const SAFE_RANGES = {
  ph:           { min: 6.5,  max: 8.5,  unit: '' },
  ammonia_ppm:  { min: 0,    max: 0.25, unit: 'ppm' },
  nitrite_ppm:  { min: 0,    max: 0.5,  unit: 'ppm' },
  nitrate_ppm:  { min: 0,    max: 40,   unit: 'ppm' },
  temperature_c:{ min: 22,   max: 30,   unit: '°C' },
} as const;

export type WaterParam = keyof typeof SAFE_RANGES;
