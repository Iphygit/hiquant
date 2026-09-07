-- HiQuant Consulting MVP database schema
-- Target: Supabase PostgreSQL 17+

begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create table public.intakes (
  id uuid primary key default gen_random_uuid(),
  first_name text not null constraint intakes_first_name_length check (
    char_length(btrim(first_name)) between 1 and 80
  ),
  last_name text not null constraint intakes_last_name_length check (
    char_length(btrim(last_name)) between 1 and 80
  ),
  company text constraint intakes_company_length check (
    company is null or char_length(company) <= 160
  ),
  job_title text constraint intakes_job_title_length check (
    job_title is null or char_length(job_title) <= 120
  ),
  email text not null constraint intakes_email_format check (
    char_length(email) between 3 and 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  phone text constraint intakes_phone_format check (
    phone is null
    or (
      char_length(phone) between 7 and 30
      and phone ~ '^[0-9+().[:space:]-]+$'
    )
  ),
  service_category text not null constraint intakes_service_category_allowed check (
    service_category in (
      'biotech_consulting',
      'pharmaceutical_consulting',
      'quality_gmp',
      'laboratory_analytical',
      'it_consulting',
      'data_automation',
      'digital_transformation',
      'strategy_advisory',
      'other'
    )
  ),
  industry text constraint intakes_industry_allowed check (
    industry is null
    or industry in (
      'biotechnology',
      'pharmaceuticals',
      'laboratory_analytical',
      'information_technology',
      'professional_services',
      'other'
    )
  ),
  project_description text not null constraint intakes_description_length check (
    char_length(btrim(project_description)) between 20 and 2000
  ),
  expected_start_date date,
  project_duration text constraint intakes_duration_allowed check (
    project_duration is null
    or project_duration in (
      'under_1_month',
      '1_to_3_months',
      '3_to_6_months',
      '6_to_12_months',
      'ongoing',
      'not_sure'
    )
  ),
  budget_range text constraint intakes_budget_allowed check (
    budget_range is null
    or budget_range in (
      'under_5000',
      '5000_15000',
      '15000_50000',
      '50000_plus',
      'not_determined'
    )
  ),
  preferred_contact_method text not null constraint intakes_contact_method_allowed check (
    preferred_contact_method in ('email', 'phone', 'video_call')
  ),
  referral_source text constraint intakes_referral_source_allowed check (
    referral_source is null
    or referral_source in (
      'professional_referral',
      'search',
      'linkedin',
      'conference_event',
      'previous_connection',
      'other'
    )
  ),
  consent_acknowledged boolean not null default false constraint intakes_consent_required check (
    consent_acknowledged = true
  ),
  consent_acknowledged_at timestamptz not null default statement_timestamp(),
  status text not null default 'new' constraint intakes_status_allowed check (
    status in (
      'new',
      'reviewing',
      'contacted',
      'qualified',
      'proposal_sent',
      'converted',
      'closed',
      'declined'
    )
  ),
  admin_notes text constraint intakes_admin_notes_length check (
    admin_notes is null or char_length(admin_notes) <= 5000
  ),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

comment on table public.intakes is
  'High-level public consulting inquiries. Do not store regulated or confidential project data.';

comment on column public.intakes.admin_notes is
  'Internal administrator notes. Never writable by anonymous clients.';

create trigger intakes_set_updated_at
before update on public.intakes
for each row execute function private.set_updated_at();

create index intakes_status_created_at_idx
  on public.intakes (status, created_at desc);

create index intakes_created_at_idx
  on public.intakes (created_at desc);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_name text not null constraint appointments_client_name_length check (
    char_length(btrim(client_name)) between 2 and 160
  ),
  client_email text not null constraint appointments_email_format check (
    char_length(client_email) between 3 and 254
    and client_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  company text constraint appointments_company_length check (
    company is null or char_length(company) <= 160
  ),
  meeting_type text not null constraint appointments_meeting_type_allowed check (
    meeting_type in (
      'initial_consultation_30',
      'project_discovery_45',
      'technical_consultation_60'
    )
  ),
  preferred_date date not null,
  preferred_time time without time zone not null,
  timezone text not null constraint appointments_timezone_length check (
    char_length(btrim(timezone)) between 1 and 100
  ),
  consultation_topic text not null constraint appointments_topic_length check (
    char_length(btrim(consultation_topic)) between 5 and 300
  ),
  client_notes text constraint appointments_client_notes_length check (
    client_notes is null or char_length(client_notes) <= 2000
  ),
  status text not null default 'requested' constraint appointments_status_allowed check (
    status in ('requested', 'confirmed', 'rescheduled', 'completed', 'cancelled')
  ),
  admin_notes text constraint appointments_admin_notes_length check (
    admin_notes is null or char_length(admin_notes) <= 5000
  ),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

comment on table public.appointments is
  'Client consultation requests. A requested time is not a confirmed appointment.';

comment on column public.appointments.admin_notes is
  'Internal administrator notes. Never writable by anonymous clients.';

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function private.set_updated_at();

create index appointments_status_preferred_date_idx
  on public.appointments (status, preferred_date, preferred_time);

create index appointments_created_at_idx
  on public.appointments (created_at desc);

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text constraint admin_profiles_full_name_length check (
    full_name is null or char_length(full_name) <= 160
  ),
  role text not null default 'admin' constraint admin_profiles_role_allowed check (
    role = 'admin'
  ),
  is_active boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

comment on table public.admin_profiles is
  'Explicit allowlist for authenticated HiQuant administrators.';

create trigger admin_profiles_set_updated_at
before update on public.admin_profiles
for each row execute function private.set_updated_at();

commit;

