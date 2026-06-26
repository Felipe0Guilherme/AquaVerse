// src/controllers/gamificationController.ts
// ============================================================
// Sistema de gamificação do AquaVerse
//
// GET  /api/gamification/xp    (público)  — XP e nível de todos
// POST /api/gamification/feed  (auth)     — alimentar peixes (+25 XP, cooldown 60s)
// POST /api/gamification/xp/add (auth)    — conceder XP (chamado internamente)
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getSupabaseAdmin } from '../config/supabase';

const XP_PER_LEVEL = 100;

function calcLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// ── GET /api/gamification/xp ─────────────────────────────────
// Devolve { username → { xp, level } } para todos os usuários
export async function getAllXp(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('profiles')
      .select('username, xp')
      .order('xp', { ascending: false });

    if (error) throw error;

    const result: Record<string, { xp: number; level: number }> = {};
    for (const row of data ?? []) {
      const xp = row.xp ?? 0;
      result[row.username] = { xp, level: calcLevel(xp) };
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/gamification/feed ──────────────────────────────
// Alimenta os peixes, concede +25 XP ao usuário com cooldown de 60s
export async function feedFish(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    if (!userId) { res.status(401).json({ success: false, error: 'Auth required.' }); return; }

    const supabase = getSupabaseAdmin();

    // Verifica cooldown: última alimentação nos últimos 60s?
    const { data: lastFeed } = await supabase
      .from('feed_events')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastFeed) {
      const elapsed = Date.now() - new Date(lastFeed.created_at).getTime();
      if (elapsed < 60_000) {
        const remaining = Math.ceil((60_000 - elapsed) / 1000);
        res.status(429).json({
          success: false,
          error: `Aguarde ${remaining}s antes de alimentar de novo.`,
        });
        return;
      }
    }

    // Registra evento de alimentação
    const { error: feedError } = await supabase
      .from('feed_events')
      .insert({ user_id: userId });
    if (feedError) throw feedError;

    // Concede +25 XP
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp, username')
      .eq('id', userId)
      .single();
    if (profileError) throw profileError;

    const newXp = (profile.xp ?? 0) + 25;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: newXp })
      .eq('id', userId);
    if (updateError) throw updateError;

    res.json({
      success: true,
      data: { xp: newXp, level: calcLevel(newXp), gained: 25 },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/gamification/xp/add ────────────────────────────
// Concede XP por ação (chamado internamente por outros controllers)
// Body: { amount: number }
export async function addXp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    if (!userId) { res.status(401).json({ success: false, error: 'Auth required.' }); return; }

    const amount = Math.min(Number(req.body?.amount ?? 0), 500); // cap de segurança
    if (amount <= 0) { res.status(400).json({ success: false, error: 'Amount must be > 0.' }); return; }

    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles').select('xp').eq('id', userId).single();

    const newXp = (profile?.xp ?? 0) + amount;
    await supabase.from('profiles').update({ xp: newXp }).eq('id', userId);

    res.json({ success: true, data: { xp: newXp, level: calcLevel(newXp), gained: amount } });
  } catch (err) {
    next(err);
  }
}
