// backend/src/routes/users.ts
// Rota pública — lista usuários para o aquário social
import { Router, Request, Response } from 'express';
import { getSupabaseAdmin } from '../config/supabase';

const router = Router();

// GET /api/users/aquarium — sem autenticação, qualquer um pode ver os peixes
router.get('/aquarium', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name, created_at, special_creature')
      .order('created_at', { ascending: true })
      .limit(100); // até 100 peixes no aquário

    if (error) throw error;

    res.json({ success: true, data: data ?? [] });
  } catch {
    res.status(500).json({ success: false, error: 'Erro ao carregar membros.' });
  }
});

export default router;