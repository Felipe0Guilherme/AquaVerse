// src/controllers/adminController.ts
// ============================================================
// Roleta de criaturas — exclusivo do admin (Sonim).
//
// GET  /api/admin/shuffle-seed  (pública) — seed atual da roleta
// POST /api/admin/reshuffle     (admin)   — aciona nova rodada
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getSupabaseAdmin } from '../config/supabase';

const ADMIN_EMAIL = 'felipeguilherma@gmail.com';

export async function getShuffleSeed(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('reshuffle_events')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    // Converte o timestamp do último evento num número inteiro (ms).
    // O frontend compara com o valor anterior — se mudou, re-sorteia.
    const seed = data ? new Date(data.created_at).getTime() : 0;
    res.json({ success: true, data: { seed } });
  } catch (error) {
    next(error);
  }
}

export async function triggerReshuffle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;

    if (authReq.user?.email !== ADMIN_EMAIL) {
      res.status(403).json({ success: false, error: 'Forbidden.' });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('reshuffle_events')
      .insert({ triggered_by: authReq.user.email });

    if (error) throw error;

    res.status(201).json({ success: true, message: '🎲 Roleta acionada!' });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/grant-special — concede peixe especial a um usuário
export async function grantSpecial(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user?.email !== ADMIN_EMAIL) {
      res.status(403).json({ success: false, error: 'Forbidden.' });
      return;
    }
    const { username, kind } = req.body;
    const validSpecials = ['anglerfish','electriceel','ghostfish','oarfish','coelacanth','mimic'];
    if (!username || !validSpecials.includes(kind)) {
      res.status(400).json({ success: false, error: 'Invalid username or kind.' });
      return;
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('profiles')
      .update({ special_creature: kind })
      .eq('username', username);
    if (error) throw error;
    res.json({ success: true, data: { username, kind } });
  } catch (err) {
    next(err);
  }
}
