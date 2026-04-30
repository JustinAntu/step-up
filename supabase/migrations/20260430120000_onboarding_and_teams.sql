-- Migration: Onboarding & Teams
-- Adds team_members junction table, invite codes, avatar fields, and onboarding tracking.

-- ── 1. Make challenge_id nullable on teams ────────────────────────────────────
-- Preserves future challenge module without breaking current team creation flow.
ALTER TABLE public.teams ALTER COLUMN challenge_id DROP NOT NULL;

-- ── 2. Add new columns to teams ──────────────────────────────────────────────
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS invite_code   TEXT,
  ADD COLUMN IF NOT EXISTS avatar_emoji  TEXT NOT NULL DEFAULT '👟',
  ADD COLUMN IF NOT EXISTS avatar_color  TEXT NOT NULL DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill invite codes for any pre-existing teams
DO $$
DECLARE
  r    RECORD;
  code TEXT;
BEGIN
  FOR r IN SELECT id FROM public.teams WHERE invite_code IS NULL LOOP
    LOOP
      code := upper(substring(md5(random()::text || clock_timestamp()::text), 1, 5));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.teams WHERE invite_code = code);
    END LOOP;
    UPDATE public.teams SET invite_code = code WHERE id = r.id;
  END LOOP;
END;
$$;

ALTER TABLE public.teams ALTER COLUMN invite_code SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teams_invite_code_unique'
  ) THEN
    ALTER TABLE public.teams ADD CONSTRAINT teams_invite_code_unique UNIQUE (invite_code);
  END IF;
END;
$$;

-- ── 3. Create team_members junction table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  user_id   UUID        NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,
  team_id   UUID        NOT NULL REFERENCES public.teams(id)  ON DELETE CASCADE,
  role      TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'owner')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, team_id)
);

CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON public.team_members (team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON public.team_members (user_id);

-- Migrate existing single-team assignments from profiles
INSERT INTO public.team_members (user_id, team_id, role)
SELECT id, team_id, 'member'
FROM   public.profiles
WHERE  team_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ── 4. Add onboarding tracking to profiles ───────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Existing users are considered already onboarded
UPDATE public.profiles
SET    onboarding_completed_at = now()
WHERE  onboarding_completed_at IS NULL;

-- ── 5. Drop the old single team_id column from profiles ──────────────────────
ALTER TABLE public.profiles DROP COLUMN IF EXISTS team_id;

-- ── 6. RLS for team_members ──────────────────────────────────────────────────
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Members can see all members of any team they belong to
CREATE POLICY "team_members_select_own_teams"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Users can join teams (insert own membership row)
CREATE POLICY "team_members_insert_own"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can leave teams (delete own membership row)
CREATE POLICY "team_members_delete_own"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ── 7. Additional RLS policies for teams ─────────────────────────────────────
CREATE POLICY "teams_insert_authenticated"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "teams_update_creator"
  ON public.teams FOR UPDATE
  TO authenticated
  USING   (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ── 8. Profiles: allow all authenticated users to read (for leaderboard) ─────
-- Drop the restrictive own-row-only policy and replace with a broader one.
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- ── 9. SECURITY DEFINER functions for leaderboard ────────────────────────────
-- These bypass the caller's daily_steps RLS so we can aggregate all users' steps.

CREATE OR REPLACE FUNCTION public.get_global_leaderboard(max_rows INT DEFAULT 50)
RETURNS TABLE (
  user_id      UUID,
  display_name TEXT,
  total_steps  BIGINT,
  rank         BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id                              AS user_id,
    p.display_name,
    COALESCE(SUM(ds.steps), 0)        AS total_steps,
    RANK() OVER (ORDER BY COALESCE(SUM(ds.steps), 0) DESC) AS rank
  FROM   public.profiles p
  LEFT JOIN public.daily_steps ds ON ds.user_id = p.id
  WHERE  p.onboarding_completed_at IS NOT NULL
  GROUP  BY p.id, p.display_name
  ORDER  BY total_steps DESC
  LIMIT  max_rows;
$$;

CREATE OR REPLACE FUNCTION public.get_team_leaderboard(p_team_id UUID)
RETURNS TABLE (
  user_id      UUID,
  display_name TEXT,
  total_steps  BIGINT,
  rank         BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id                              AS user_id,
    p.display_name,
    COALESCE(SUM(ds.steps), 0)        AS total_steps,
    RANK() OVER (ORDER BY COALESCE(SUM(ds.steps), 0) DESC) AS rank
  FROM   public.team_members tm
  JOIN   public.profiles p     ON p.id       = tm.user_id
  LEFT JOIN public.daily_steps ds ON ds.user_id = tm.user_id
  WHERE  tm.team_id = p_team_id
  GROUP  BY p.id, p.display_name
  ORDER  BY total_steps DESC;
$$;

-- ── 10. Atomic team creation function ────────────────────────────────────────
-- Creates team + owner membership + marks onboarding complete in one transaction.
CREATE OR REPLACE FUNCTION public.create_team_with_owner(
  p_name         TEXT,
  p_avatar_emoji TEXT,
  p_avatar_color TEXT,
  p_invite_code  TEXT
)
RETURNS TABLE (team_id UUID, invite_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team_id UUID;
BEGIN
  INSERT INTO public.teams (name, avatar_emoji, avatar_color, invite_code, created_by)
  VALUES (p_name, p_avatar_emoji, p_avatar_color, upper(p_invite_code), auth.uid())
  RETURNING id INTO v_team_id;

  INSERT INTO public.team_members (user_id, team_id, role)
  VALUES (auth.uid(), v_team_id, 'owner');

  UPDATE public.profiles
  SET    onboarding_completed_at = now()
  WHERE  id = auth.uid();

  RETURN QUERY SELECT v_team_id, upper(p_invite_code);
END;
$$;

-- ── 11. Atomic team join function ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.join_team_by_code(p_invite_code TEXT)
RETURNS TABLE (team_id UUID, team_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team_id   UUID;
  v_team_name TEXT;
BEGIN
  SELECT id, name INTO v_team_id, v_team_name
  FROM   public.teams
  WHERE  invite_code = upper(p_invite_code);

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'No team found with invite code %', upper(p_invite_code);
  END IF;

  INSERT INTO public.team_members (user_id, team_id, role)
  VALUES (auth.uid(), v_team_id, 'member')
  ON CONFLICT DO NOTHING;

  UPDATE public.profiles
  SET    onboarding_completed_at = now()
  WHERE  id = auth.uid();

  RETURN QUERY SELECT v_team_id, v_team_name;
END;
$$;

-- ── 12. Complete onboarding without a team ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_onboarding()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET    onboarding_completed_at = now()
  WHERE  id = auth.uid()
    AND  onboarding_completed_at IS NULL;
END;
$$;

-- ── 13. Grant execute permissions ────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.get_global_leaderboard    TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_leaderboard      TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_team_with_owner    TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_team_by_code         TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_onboarding       TO authenticated;
