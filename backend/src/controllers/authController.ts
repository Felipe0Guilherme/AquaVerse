// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/supabase';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, JwtPayload } from '../types';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  full_name: z.string().max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function issueTokenAndSetCookie(res: Response, payload: JwtPayload): string {
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return token;
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          username: body.username,
          full_name: body.full_name ?? null,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        throw new AppError(409, 'An account with this email already exists.');
      }
      throw new AppError(400, error.message);
    }

    if (!data.user) {
      throw new AppError(400, 'Failed to create user.');
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        username: body.username,
        full_name: body.full_name ?? null,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert error (non-fatal):', profileError.message);
    }

    const payload: JwtPayload = {
      sub: data.user.id,
      email: data.user.email!,
    };

    // ← Captura o token retornado
    const token = issueTokenAndSetCookie(res, payload);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token, // ← retorna no body para o frontend guardar
      data: {
        id: data.user.id,
        email: data.user.email,
        username: body.username,
        full_name: body.full_name ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error || !data.user) {
      throw new AppError(401, 'Invalid email or password.');
    }

    const payload: JwtPayload = {
      sub: data.user.id,
      email: data.user.email!,
    };

    // ← Captura o token retornado
    const token = issueTokenAndSetCookie(res, payload);

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token, // ← retorna no body para o frontend guardar
      data: {
        id: data.user.id,
        email: data.user.email,
        ...profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie('access_token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
}

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, created_at')
      .eq('id', req.user.sub)
      .single();

    if (error || !profile) {
      throw new AppError(404, 'Profile not found.');
    }

    res.json({
      success: true,
      data: { ...profile, email: req.user.email },
    });
  } catch (error) {
    next(error);
  }
}