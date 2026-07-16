// src/controllers/gamificationController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getSupabaseAdmin } from '../config/supabase';

const XP_PER_LEVEL = 100;
function calcLevel(xp: number): number { return Math.floor(xp / XP_PER_LEVEL) + 1; }

type BadgeKey = 'first_fish'|'msg10'|'msg50'|'feed10'|'feed50'|'streak3'|'streak7'|'streak30'|'likes10'|'likes50'|'legendary'|'level10'|'level30';

async function checkAndGrantBadges(userId: string, profile: any, supabase: any) {
  const current: BadgeKey[] = profile.badges ?? [];
  const toGrant: BadgeKey[] = [];

  if (!current.includes('first_fish'))              toGrant.push('first_fish');
  if (profile.msg_count  >= 10  && !current.includes('msg10'))   toGrant.push('msg10');
  if (profile.msg_count  >= 50  && !current.includes('msg50'))   toGrant.push('msg50');
  if (profile.feed_count >= 10  && !current.includes('feed10'))  toGrant.push('feed10');
  if (profile.feed_count >= 50  && !current.includes('feed50'))  toGrant.push('feed50');
  if (profile.login_streak >= 3 && !current.includes('streak3')) toGrant.push('streak3');
  if (profile.login_streak >= 7 && !current.includes('streak7')) toGrant.push('streak7');
  if (profile.login_streak >= 30&& !current.includes('streak30'))toGrant.push('streak30');
  if (profile.likes_received>=10&& !current.includes('likes10')) toGrant.push('likes10');
  if (profile.likes_received>=50&& !current.includes('likes50')) toGrant.push('likes50');
  if (calcLevel(profile.xp)>=10 && !current.includes('level10')) toGrant.push('level10');
  if (calcLevel(profile.xp)>=30 && !current.includes('level30')) toGrant.push('level30');

  if (toGrant.length > 0) {
    await supabase.from('profiles')
      .update({ badges: [...current, ...toGrant] })
      .eq('id', userId);
  }
}

// GET /api/gamification/stats — XP, ranking, likes de todos
export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, xp, badges, login_streak, likes_received, display_level')
      .order('xp', { ascending: false });
    if (error) throw error;

    const { data: likeRows } = await supabase
      .from('fish_likes')
      .select('to_username, count:to_username.count()')
      .limit(500);

    const likesMap: Record<string,number> = {};
    for (const row of likeRows ?? []) {
      likesMap[row.to_username] = Number(row.count);
    }

    const xpMap: Record<string,any> = {};
    const ranking: any[] = [];
    for (const p of profiles ?? []) {
      const xp = p.xp ?? 0;
      const level = calcLevel(xp);
      xpMap[p.username] = { xp, level, badges: p.badges ?? [], streak: p.login_streak ?? 0, displayLevel: p.display_level ?? null };
      ranking.push({ username: p.username, xp, level });
    }

    res.json({ success: true, data: { xpMap, ranking: ranking.slice(0, 10), likes: likesMap } });
  } catch (err) { next(err); }
}

// POST /api/gamification/display-level — escolhe qual peixe (de um nível já alcançado)
// o usuário quer exibir no aquário, ou volta ao modo automático (level: null)
export async function setDisplayLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    if (!userId) { res.status(401).json({ success: false, error: 'Auth required.' }); return; }

    const rawLevel = req.body?.level;
    const level: number | null = rawLevel === null || rawLevel === undefined ? null : Number(rawLevel);
    if (level !== null && (!Number.isInteger(level) || level < 1)) {
      res.status(400).json({ success: false, error: 'Invalid level.' });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles').select('xp')
      .eq('id', userId).single();

    const currentLevel = calcLevel(profile?.xp ?? 0);
    if (level !== null && level > currentLevel) {
      res.status(400).json({ success: false, error: 'You have not unlocked that level yet.' });
      return;
    }

    await supabase.from('profiles').update({ display_level: level }).eq('id', userId);

    res.json({ success: true, data: { displayLevel: level } });
  } catch (err) { next(err); }
}

// POST /api/gamification/feed — alimentar (+25 XP, cooldown 60s)
export async function feedFish(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    if (!userId) { res.status(401).json({ success:false, error:'Auth required.' }); return; }

    const supabase = getSupabaseAdmin();
    const { data: lastFeed } = await supabase
      .from('feed_events').select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending:false })
      .limit(1).maybeSingle();

    if (lastFeed) {
      const elapsed = Date.now() - new Date(lastFeed.created_at).getTime();
      if (elapsed < 60_000) {
        res.status(429).json({ success:false, error:`Aguarde ${Math.ceil((60_000-elapsed)/1000)}s antes de alimentar de novo.` });
        return;
      }
    }

    await supabase.from('feed_events').insert({ user_id: userId });

    const { data: profile } = await supabase
      .from('profiles').select('xp, feed_count, badges, msg_count, login_streak, likes_received')
      .eq('id', userId).single();

    const newXp        = (profile?.xp ?? 0) + 25;
    const newFeedCount = (profile?.feed_count ?? 0) + 1;
    await supabase.from('profiles').update({ xp: newXp, feed_count: newFeedCount }).eq('id', userId);
    await checkAndGrantBadges(userId, { ...profile, xp: newXp, feed_count: newFeedCount }, supabase);

    res.json({ success:true, data:{ xp:newXp, level:calcLevel(newXp), gained:25 } });
  } catch (err) { next(err); }
}

// POST /api/gamification/xp/add — XP por ação (mensagem, etc.)
export async function addXp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    if (!userId) { res.status(401).json({ success:false, error:'Auth required.' }); return; }

    const reason = String(req.body?.reason ?? '');
    const amount = Math.min(Number(req.body?.amount ?? 0), 100);
    if (amount <= 0) { res.status(400).json({ success:false, error:'Amount must be > 0.' }); return; }

    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles').select('xp, msg_count, feed_count, badges, login_streak, likes_received')
      .eq('id', userId).single();

    const newXp      = (profile?.xp ?? 0) + amount;
    const newMsgCount= reason === 'message' ? (profile?.msg_count ?? 0) + 1 : (profile?.msg_count ?? 0);
    await supabase.from('profiles').update({ xp: newXp, msg_count: newMsgCount }).eq('id', userId);
    await checkAndGrantBadges(userId, { ...profile, xp: newXp, msg_count: newMsgCount }, supabase);

    res.json({ success:true, data:{ xp:newXp, level:calcLevel(newXp), gained:amount } });
  } catch (err) { next(err); }
}

// POST /api/gamification/daily — bônus de login diário (+30 XP + streak)
export async function dailyBonus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    if (!userId) { res.status(401).json({ success:false, error:'Auth required.' }); return; }

    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles').select('xp, last_login_date, login_streak, badges, msg_count, feed_count, likes_received')
      .eq('id', userId).single();

    const today     = new Date().toISOString().slice(0,10);
    const lastLogin = profile?.last_login_date ?? '';
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);

    if (lastLogin === today) {
      res.status(429).json({ success:false, error:'Bônus já recebido hoje.' });
      return;
    }

    const newStreak = lastLogin === yesterday ? (profile?.login_streak ?? 0) + 1 : 1;
    const newXp     = (profile?.xp ?? 0) + 30 + (newStreak >= 7 ? 20 : newStreak >= 3 ? 10 : 0);

    await supabase.from('profiles').update({
      xp: newXp, last_login_date: today, login_streak: newStreak,
    }).eq('id', userId);
    await checkAndGrantBadges(userId, { ...profile, xp: newXp, login_streak: newStreak }, supabase);

    res.json({ success:true, data:{ xp:newXp, level:calcLevel(newXp), streak:newStreak, gained:30 } });
  } catch (err) { next(err); }
}

// POST /api/gamification/like/:username — curtir peixe
export async function likeFish(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const fromUserId = authReq.user?.sub;
    const toUsername = req.params.username;
    if (!fromUserId) { res.status(401).json({ success:false, error:'Auth required.' }); return; }

    const supabase = getSupabaseAdmin();
    const { data: toProfile } = await supabase
      .from('profiles').select('id, xp, likes_received, badges, msg_count, feed_count, login_streak')
      .eq('username', toUsername).single();
    if (!toProfile) { res.status(404).json({ success:false, error:'User not found.' }); return; }

    const { error: insertErr } = await supabase.from('fish_likes').insert({
      from_user_id: fromUserId, to_username: toUsername, to_user_id: toProfile.id,
    });
    if (insertErr) { res.status(409).json({ success:false, error:'Already liked.' }); return; }

    const newXp      = (toProfile.xp ?? 0) + 5;
    const newLikes   = (toProfile.likes_received ?? 0) + 1;
    await supabase.from('profiles').update({ xp: newXp, likes_received: newLikes }).eq('id', toProfile.id);
    await checkAndGrantBadges(toProfile.id, { ...toProfile, xp: newXp, likes_received: newLikes }, supabase);

    res.json({ success:true });
  } catch (err) { next(err); }
}

// DELETE /api/gamification/like/:username — descurtir
export async function unlikeFish(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const fromUserId = authReq.user?.sub;
    const toUsername = req.params.username;
    if (!fromUserId) { res.status(401).json({ success:false, error:'Auth required.' }); return; }

    const supabase = getSupabaseAdmin();
    await supabase.from('fish_likes').delete()
      .eq('from_user_id', fromUserId).eq('to_username', toUsername);

    const { data: toProfile } = await supabase
      .from('profiles').select('id, xp, likes_received')
      .eq('username', toUsername).single();
    if (toProfile) {
      await supabase.from('profiles').update({
        xp: Math.max(0, (toProfile.xp ?? 0) - 5),
        likes_received: Math.max(0, (toProfile.likes_received ?? 0) - 1),
      }).eq('id', toProfile.id);
    }

    res.json({ success:true });
  } catch (err) { next(err); }
}

// POST /api/gamification/eat — comer comida (+30 XP, sem cooldown curto mas anti-spam por ID)
export async function eatFood(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    if (!userId) { res.status(401).json({ success: false, error: 'Auth required.' }); return; }

    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles').select('xp, msg_count, feed_count, badges, login_streak, likes_received')
      .eq('id', userId).single();

    const newXp = (profile?.xp ?? 0) + 30;
    await supabase.from('profiles').update({ xp: newXp }).eq('id', userId);
    await checkAndGrantBadges(userId, { ...profile, xp: newXp }, supabase);

    res.json({ success: true, data: { xp: newXp, level: calcLevel(newXp), gained: 30 } });
  } catch (err) { next(err); }
}