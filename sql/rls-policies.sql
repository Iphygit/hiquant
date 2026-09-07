-- HiQuant Consulting least-privilege grants and Row Level Security policies

begin;

alter table public.intakes enable row level security;
alter table public.appointments enable row level security;
alter table public.admin_profiles enable row level security;

revoke all on table public.intakes from anon, authenticated;
revoke all on table public.appointments from anon, authenticated;
revoke all on table public.admin_profiles from anon, authenticated;

-- Anonymous website visitors can provide only client-owned intake fields.
grant insert (
  first_name,
  last_name,
  company,
  job_title,
  email,
  phone,
  service_category,
  industry,
  project_description,
  expected_start_date,
  project_duration,
  budget_range,
  preferred_contact_method,
  referral_source,
  consent_acknowledged
) on public.intakes to anon;

-- Anonymous website visitors can provide only client-owned appointment fields.
grant insert (
  client_name,
  client_email,
  company,
  meeting_type,
  preferred_date,
  preferred_time,
  timezone,
  consultation_topic,
  client_notes
) on public.appointments to anon;

-- Authenticated users still need an active admin_profiles row to pass RLS.
grant select on public.intakes to authenticated;
grant update (status, admin_notes) on public.intakes to authenticated;
grant select on public.appointments to authenticated;
grant update (status, admin_notes) on public.appointments to authenticated;
grant select on public.admin_profiles to authenticated;

-- The server-only service role retains operational access and bypasses RLS.
grant all on public.intakes, public.appointments, public.admin_profiles to service_role;

create policy "Public can submit constrained intakes"
on public.intakes
for insert
to anon
with check (
  status = 'new'
  and admin_notes is null
  and consent_acknowledged = true
  and (
    expected_start_date is null
    or expected_start_date >= current_date
  )
);

create policy "Public can request constrained appointments"
on public.appointments
for insert
to anon
with check (
  status = 'requested'
  and admin_notes is null
  and preferred_date >= current_date
);

create policy "Users can read their own admin membership"
on public.admin_profiles
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
);

create policy "Active admins can read intakes"
on public.intakes
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = (select auth.uid())
      and admin_profiles.role = 'admin'
      and admin_profiles.is_active = true
  )
);

create policy "Active admins can update intakes"
on public.intakes
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = (select auth.uid())
      and admin_profiles.role = 'admin'
      and admin_profiles.is_active = true
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = (select auth.uid())
      and admin_profiles.role = 'admin'
      and admin_profiles.is_active = true
  )
);

create policy "Active admins can read appointments"
on public.appointments
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = (select auth.uid())
      and admin_profiles.role = 'admin'
      and admin_profiles.is_active = true
  )
);

create policy "Active admins can update appointments"
on public.appointments
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = (select auth.uid())
      and admin_profiles.role = 'admin'
      and admin_profiles.is_active = true
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = (select auth.uid())
      and admin_profiles.role = 'admin'
      and admin_profiles.is_active = true
  )
);

commit;

