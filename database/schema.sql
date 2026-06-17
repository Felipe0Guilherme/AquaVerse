-- ============================================================
-- AquaMonitor Dashboard — Database Schema
-- PostgreSQL (Supabase compatible)
-- ============================================================

-- Enable UUID extension (already enabled on Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- Extends Supabase's built-in auth.users with app-level data.
-- We do NOT duplicate sensitive auth data (email/password) here.
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    VARCHAR(50)  UNIQUE NOT NULL,
  full_name   VARCHAR(100),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: aquariums
-- A user can own multiple aquariums, each with its own logs.
-- ============================================================
CREATE TABLE aquariums (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  volume_l    NUMERIC(8,2),         -- Volume in liters
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: aquarium_logs
-- Core data table: water parameter measurements per aquarium.
-- All parameter columns are nullable — a user may not measure all
-- parameters at every reading.
-- ============================================================
CREATE TABLE aquarium_logs (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  aquarium_id  UUID        NOT NULL REFERENCES aquariums(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Water parameters
  ph           NUMERIC(4,2),   -- Safe range: 6.5 – 8.5
  ammonia_ppm  NUMERIC(6,4),   -- Amônia (NH3/NH4+). Danger: > 0.25 ppm
  nitrite_ppm  NUMERIC(6,4),   -- Nitrito (NO2-).   Danger: > 0.5 ppm
  nitrate_ppm  NUMERIC(6,2),   -- Nitrato (NO3-).   Danger: > 40 ppm
  temperature_c NUMERIC(4,1),  -- Temperature in Celsius

  -- Optional enrichment
  notes        TEXT,
  measured_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When was it actually measured
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- Composite index on the two most common query patterns:
--   1. All logs for a given aquarium, sorted by time
--   2. All logs for a given user (for cross-aquarium dashboards)
-- ============================================================
CREATE INDEX idx_logs_aquarium_time ON aquarium_logs (aquarium_id, measured_at DESC);
CREATE INDEX idx_logs_user_time     ON aquarium_logs (user_id,     measured_at DESC);
CREATE INDEX idx_aquariums_user     ON aquariums (user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Supabase
-- Each user can only see and modify their own data.
-- ============================================================
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE aquariums      ENABLE ROW LEVEL SECURITY;
ALTER TABLE aquarium_logs  ENABLE ROW LEVEL SECURITY;

-- Profiles: read own profile, update own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Aquariums: full CRUD on own aquariums
CREATE POLICY "Users manage own aquariums"
  ON aquariums FOR ALL USING (auth.uid() = user_id);

-- Logs: full CRUD on own logs
CREATE POLICY "Users manage own logs"
  ON aquarium_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- Auto-update `updated_at` on profiles and aquariums.
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER aquariums_updated_at
  BEFORE UPDATE ON aquariums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCTION: auto-create profile on new user signup
-- Triggered by Supabase's auth.users insert event.
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA (optional — for local development)
-- ============================================================
-- To seed, first create a user in Supabase Auth dashboard,
-- then run this with the actual UUID:
--
-- INSERT INTO aquariums (user_id, name, volume_l, description)
-- VALUES ('<your-user-uuid>', 'Aquário Principal', 200, 'Ciclideos africanos');
