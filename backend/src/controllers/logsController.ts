// src/controllers/logsController.ts
// ============================================================
// Aquarium logs CRUD controller.
//
// All endpoints require authentication (applied in router).
// RLS on the DB is a second layer of defence — even if auth
// middleware were bypassed, Supabase would still block it.
// ============================================================

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, PaginatedResponse, AquariumLog } from '../types';

// ── Validation schemas ───────────────────────────────────────

const createLogSchema = z.object({
  aquarium_id: z.string().uuid('Invalid aquarium ID'),
  ph: z.number().min(0).max(14).nullable().optional(),
  ammonia_ppm: z.number().min(0).max(10).nullable().optional(),
  nitrite_ppm: z.number().min(0).max(10).nullable().optional(),
  nitrate_ppm: z.number().min(0).max(500).nullable().optional(),
  temperature_c: z.number().min(0).max(50).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  measured_at: z.string().datetime().optional(), // ISO 8601
});

const updateLogSchema = createLogSchema.partial().omit({ aquarium_id: true });

const querySchema = z.object({
  aquarium_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['measured_at', 'created_at']).default('measured_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  from: z.string().datetime().optional(), // date range filter
  to: z.string().datetime().optional(),
});

// ── Controller methods ───────────────────────────────────────

/**
 * GET /api/logs
 * Lists paginated logs for the authenticated user.
 * Supports filtering by aquarium_id and date range.
 */
export async function getLogs(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = querySchema.parse(req.query);
    const supabase = getSupabaseAdmin();

    // Build the query — always filter by user_id for safety
    let dbQuery = supabase
      .from('aquarium_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.sub)
      .order(query.sort, { ascending: query.order === 'asc' });

    if (query.aquarium_id) {
      dbQuery = dbQuery.eq('aquarium_id', query.aquarium_id);
    }
    if (query.from) {
      dbQuery = dbQuery.gte('measured_at', query.from);
    }
    if (query.to) {
      dbQuery = dbQuery.lte('measured_at', query.to);
    }

    // Pagination — Supabase uses range(from, to) (inclusive, 0-indexed)
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;
    dbQuery = dbQuery.range(from, to);

    const { data, error, count } = await dbQuery;

    if (error) throw new AppError(500, error.message);

    const total = count ?? 0;
    const response: PaginatedResponse<AquariumLog> = {
      success: true,
      data: data as AquariumLog[],
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/logs/:id
 * Returns a single log entry. Validates ownership via user_id filter.
 */
export async function getLogById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('aquarium_logs')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.sub) // ownership check
      .single();

    if (error || !data) {
      throw new AppError(404, 'Log entry not found.');
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/logs
 * Creates a new measurement log.
 * Validates that the aquarium belongs to the user before inserting.
 */
export async function createLog(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createLogSchema.parse(req.body);
    const supabase = getSupabaseAdmin();

    // Verify aquarium ownership
    const { data: aquarium } = await supabase
      .from('aquariums')
      .select('id')
      .eq('id', body.aquarium_id)
      .eq('user_id', req.user.sub)
      .single();

    if (!aquarium) {
      throw new AppError(404, 'Aquarium not found or does not belong to you.');
    }

    const { data, error } = await supabase
      .from('aquarium_logs')
      .insert({
        ...body,
        user_id: req.user.sub, // always from token, never from body
        measured_at: body.measured_at ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new AppError(500, error.message);

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/logs/:id
 * Partially updates an existing log. Only the owner can update.
 */
export async function updateLog(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = updateLogSchema.parse(req.body);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('aquarium_logs')
      .update(body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.sub) // ownership check
      .select()
      .single();

    if (error || !data) {
      throw new AppError(404, 'Log entry not found or access denied.');
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/logs/:id
 * Deletes a log entry. Only the owner can delete.
 */
export async function deleteLog(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const { error, count } = await supabase
      .from('aquarium_logs')
      .delete({ count: 'exact' })
      .eq('id', req.params.id)
      .eq('user_id', req.user.sub); // ownership check

    if (error) throw new AppError(500, error.message);
    if (count === 0) throw new AppError(404, 'Log entry not found or access denied.');

    res.json({ success: true, message: 'Log entry deleted.' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/logs/stats
 * Returns aggregated stats for the dashboard (latest values + averages).
 * Great for charts — returns the last 30 days of readings.
 */
export async function getStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { aquarium_id } = z
      .object({ aquarium_id: z.string().uuid().optional() })
      .parse(req.query);

    const supabase = getSupabaseAdmin();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let dbQuery = supabase
      .from('aquarium_logs')
      .select('ph, ammonia_ppm, nitrite_ppm, nitrate_ppm, temperature_c, measured_at')
      .eq('user_id', req.user.sub)
      .gte('measured_at', thirtyDaysAgo.toISOString())
      .order('measured_at', { ascending: true })
      .limit(200); // Enough data points for a 30-day chart

    if (aquarium_id) {
      dbQuery = dbQuery.eq('aquarium_id', aquarium_id);
    }

    const { data, error } = await dbQuery;
    if (error) throw new AppError(500, error.message);

    const logs = data ?? [];

    // Compute latest values for KPI cards
    const latest = logs[logs.length - 1] ?? null;

    // Compute 7-day averages for context
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = logs.filter(
      (l) => new Date(l.measured_at) >= sevenDaysAgo
    );

    const avg = (key: keyof typeof latest) => {
      const vals = recent
        .map((l) => l[key] as number | null)
        .filter((v): v is number => v !== null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };

    res.json({
      success: true,
      data: {
        chart: logs,   // Raw time-series for Recharts
        latest,        // Latest reading for KPI cards
        averages: {    // 7-day averages
          ph: avg('ph'),
          ammonia_ppm: avg('ammonia_ppm'),
          nitrite_ppm: avg('nitrite_ppm'),
          nitrate_ppm: avg('nitrate_ppm'),
          temperature_c: avg('temperature_c'),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
