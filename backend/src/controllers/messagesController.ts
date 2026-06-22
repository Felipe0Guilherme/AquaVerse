// src/controllers/messagesController.ts
// ============================================================
// Chat do Aquário Social — mensagens efêmeras exibidas como
// balão de fala acima do peixe do usuário que enviou.
//
// POST /api/messages        (autenticado) — envia uma mensagem
// GET  /api/messages/recent (pública)     — lista as últimas ~30s
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getSupabaseAdmin } from '../config/supabase';

const MAX_TEXT_LENGTH = 80;
// Um pouco maior que os 25s que o balão fica visível no frontend,
// pra dar margem de sobra ao polling de 3 em 3 segundos.
const RECENT_WINDOW_SECONDS = 30;

export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;


    const userId = authReq.user?.id;
    const username = authReq.user?.username;

    if (!userId || !username) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const text = String(req.body?.text ?? '').trim();

    if (!text) {
      res.status(400).json({ success: false, error: 'Message text is required.' });
      return;
    }
    if (text.length > MAX_TEXT_LENGTH) {
      res.status(400).json({
        success: false,
        error: `Message must be at most ${MAX_TEXT_LENGTH} characters.`,
      });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('messages')
      .insert({ user_id: userId, username, text })
      .select('id, username, text, created_at')
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getRecentMessages(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const since = new Date(Date.now() - RECENT_WINDOW_SECONDS * 1000).toISOString();

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('messages')
      .select('username, text, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;

    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    next(error);
  }
}