-- Run this only after manually creating the administrator in Supabase Auth.
-- Replace the placeholder email before executing the block.

do $$
declare
  admin_email constant text := 'REPLACE_WITH_ADMIN_EMAIL';
  admin_user_id uuid;
begin
  if admin_email = 'REPLACE_WITH_ADMIN_EMAIL' then
    raise exception 'Replace REPLACE_WITH_ADMIN_EMAIL before running this script.';
  end if;

  select id
    into admin_user_id
    from auth.users
   where lower(email) = lower(admin_email)
   limit 1;

  if admin_user_id is null then
    raise exception 'No Supabase Auth user exists for %.', admin_email;
  end if;

  insert into public.admin_profiles (user_id, full_name, role, is_active)
  values (admin_user_id, null, 'admin', true)
  on conflict (user_id) do update
    set role = 'admin',
        is_active = true,
        updated_at = statement_timestamp();
end;
$$;

