-- Read-only Phase 4 security assertions.
-- Run as the database owner in the Supabase SQL editor after the migration.

do $$
declare
  rls_table_count integer;
  matching_policy_count integer;
begin
  select count(*)
    into rls_table_count
    from pg_catalog.pg_tables
   where schemaname = 'public'
     and tablename in ('intakes', 'appointments', 'admin_profiles')
     and rowsecurity = true;

  if rls_table_count <> 3 then
    raise exception 'Expected RLS on 3 HiQuant tables; found %.', rls_table_count;
  end if;

  select count(*)
    into matching_policy_count
    from pg_catalog.pg_policies
   where schemaname = 'public'
     and policyname in (
       'Public can submit constrained intakes',
       'Public can request constrained appointments',
       'Users can read their own admin membership',
       'Active admins can read intakes',
       'Active admins can update intakes',
       'Active admins can read appointments',
       'Active admins can update appointments'
     );

  if matching_policy_count <> 7 then
    raise exception 'Expected 7 HiQuant RLS policies; found %.', matching_policy_count;
  end if;

  if has_table_privilege('anon', 'public.intakes', 'SELECT')
     or has_table_privilege('anon', 'public.intakes', 'UPDATE')
     or has_table_privilege('anon', 'public.intakes', 'DELETE') then
    raise exception 'anon has a forbidden privilege on public.intakes.';
  end if;

  if has_column_privilege('anon', 'public.intakes', 'status', 'INSERT')
     or has_column_privilege('anon', 'public.intakes', 'admin_notes', 'INSERT')
     or has_column_privilege('anon', 'public.intakes', 'created_at', 'INSERT') then
    raise exception 'anon can insert a protected intake column.';
  end if;

  if not has_column_privilege('anon', 'public.intakes', 'first_name', 'INSERT')
     or not has_column_privilege('anon', 'public.intakes', 'project_description', 'INSERT')
     or not has_column_privilege('anon', 'public.intakes', 'consent_acknowledged', 'INSERT') then
    raise exception 'anon is missing an approved intake insert privilege.';
  end if;

  if has_table_privilege('anon', 'public.appointments', 'SELECT')
     or has_table_privilege('anon', 'public.appointments', 'UPDATE')
     or has_table_privilege('anon', 'public.appointments', 'DELETE') then
    raise exception 'anon has a forbidden privilege on public.appointments.';
  end if;

  if has_column_privilege('anon', 'public.appointments', 'status', 'INSERT')
     or has_column_privilege('anon', 'public.appointments', 'admin_notes', 'INSERT') then
    raise exception 'anon can insert a protected appointment column.';
  end if;

  if has_table_privilege('authenticated', 'public.admin_profiles', 'INSERT')
     or has_table_privilege('authenticated', 'public.admin_profiles', 'UPDATE')
     or has_table_privilege('authenticated', 'public.admin_profiles', 'DELETE') then
    raise exception 'authenticated users can change admin membership.';
  end if;

  if has_table_privilege('authenticated', 'public.intakes', 'DELETE')
     or has_table_privilege('authenticated', 'public.appointments', 'DELETE') then
    raise exception 'authenticated users have forbidden delete privileges.';
  end if;

  raise notice 'Phase 4 security assertions passed.';
end;
$$;

select schemaname, tablename, rowsecurity
from pg_catalog.pg_tables
where schemaname = 'public'
  and tablename in ('intakes', 'appointments', 'admin_profiles')
order by tablename;

select schemaname, tablename, policyname, roles, cmd
from pg_catalog.pg_policies
where schemaname = 'public'
  and tablename in ('intakes', 'appointments', 'admin_profiles')
order by tablename, cmd, policyname;

