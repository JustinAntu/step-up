-- If you already ran the Adam dev seed with @email.com, Auth may reject it.
-- This rewrites the address to @example.com (RFC 2606) and syncs identity metadata.
-- Safe to re-run.

update auth.users
set email = 'adam.smith@example.com'
where id = '33333333-3333-3333-3333-333333333333'
   or lower(email) = lower('adam.smith@email.com');

update auth.identities
set identity_data = jsonb_set(
  coalesce(identity_data, '{}'::jsonb),
  '{email}',
  to_jsonb('adam.smith@example.com'::text),
  true
)
where user_id = '33333333-3333-3333-3333-333333333333';
