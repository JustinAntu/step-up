-- Optional pilot seed: one challenge + two teams (fixed UUIDs). Safe to re-run.
-- After this, assign users in SQL: update public.profiles set team_id = '...' where id = '...';

insert into public.challenges (id, name, starts_on, ends_on)
values (
  '11111111-1111-1111-1111-111111111111',
  'Pilot challenge',
  (current_date - interval '7 days')::date,
  (current_date + interval '30 days')::date
)
on conflict (id) do nothing;

insert into public.teams (id, challenge_id, name, color)
values
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Team A',
    'oklch(0.62 0.19 250)'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Team B',
    'oklch(0.62 0.19 28)'
  )
on conflict (id) do nothing;
