-- Dev seed: default builder account "Adam Smith" on Team A (pilot seed).
-- Safe to re-run: skips insert if email exists; still syncs profile team + display name.
--
-- Sign in (password): use Supabase Auth "Email" with password, then:
--   Email:    adam.smith@example.com  (example.com is reserved for docs/tests; avoids invalid-domain checks)
--   Password: StepUpDev123!
-- (Change password in Dashboard → Authentication → Users after first login, or rotate in SQL.)
--
-- Team A id must match 20250430000002_seed_pilot_example.sql. Run that seed before this file.

create extension if not exists pgcrypto;

do $$
declare
  v_user_id uuid := '33333333-3333-3333-3333-333333333333';
  v_email text := 'adam.smith@example.com';
  v_team_a uuid := '22222222-2222-2222-2222-222222222221';
  v_password text := 'StepUpDev123!';
  v_hash text := crypt(v_password, gen_salt('bf'));
begin
  -- Already seeded (current @example.com or legacy @email.com), or fixed UUID present
  if exists (
    select 1
    from auth.users
    where id = v_user_id
       or lower(email) = lower(v_email)
       or lower(email) = lower('adam.smith@email.com')
  ) then
    update auth.users
    set email = v_email
    where id = v_user_id
       or lower(email) = lower('adam.smith@email.com');

    update auth.identities
    set identity_data = jsonb_set(
      coalesce(identity_data, '{}'::jsonb),
      '{email}',
      to_jsonb(v_email::text),
      true
    )
    where user_id = v_user_id;

    update public.profiles p
    set
      display_name = 'Adam Smith',
      team_id = v_team_a,
      timezone = coalesce(nullif(trim(p.timezone), ''), 'UTC')
    from auth.users u
    where p.id = u.id
      and (
        lower(u.email) = lower(v_email)
        or u.id = v_user_id
        or lower(u.email) = lower('adam.smith@email.com')
      );
    return;
  end if;

  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new
  )
  values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Adam Smith'),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object(
      'sub',
      v_user_id::text,
      'email',
      v_email,
      'email_verified',
      true
    ),
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );

  update public.profiles
  set
    display_name = 'Adam Smith',
    team_id = v_team_a,
    timezone = 'UTC'
  where id = v_user_id;
end $$;
