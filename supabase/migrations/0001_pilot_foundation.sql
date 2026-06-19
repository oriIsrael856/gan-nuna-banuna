create extension if not exists "pgcrypto";

create type public.user_role as enum ('parent', 'teacher', 'admin');
create type public.attendance_status as enum ('arrived', 'not_arrived', 'late', 'left_early');
create type public.contract_status as enum ('draft', 'sent', 'viewed', 'signed', 'declined', 'expired', 'error');

create table public.daycares (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  daycare_id uuid references public.daycares(id) on delete set null,
  role public.user_role not null,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  full_name text not null,
  birth_date date,
  gender text check (gender in ('male', 'female')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  relationship_type text not null,
  created_at timestamptz not null default now()
);

create table public.child_guardians (
  child_id uuid not null references public.children(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  is_primary_contact boolean not null default false,
  primary key (child_id, guardian_id)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  attendance_date date not null,
  status public.attendance_status not null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (child_id, attendance_date)
);

create table public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  report_date date not null,
  title text not null default 'סיכום יום',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (daycare_id, report_date)
);

create table public.daily_activities (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.daily_reports(id) on delete cascade,
  title text not null,
  description text,
  activity_time time,
  category text,
  created_at timestamptz not null default now()
);

create table public.daily_meals (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.daily_reports(id) on delete cascade,
  meal_type text not null,
  title text not null,
  description text,
  meal_time time,
  created_at timestamptz not null default now()
);

create table public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.daily_reports(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  note_type text not null default 'general',
  text text not null,
  created_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  guardian_id uuid references public.guardians(id) on delete set null,
  file_path text,
  file_name text not null,
  status public.contract_status not null default 'draft',
  activity_year text,
  period_start date,
  period_end date,
  sent_at timestamptz,
  expiry_date date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index profiles_daycare_id_idx on public.profiles(daycare_id);
create index children_daycare_id_idx on public.children(daycare_id);
create index guardians_daycare_id_idx on public.guardians(daycare_id);
create index attendance_child_date_idx on public.attendance_records(child_id, attendance_date);
create index contracts_child_id_idx on public.contracts(child_id);

alter table public.daycares enable row level security;
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.guardians enable row level security;
alter table public.child_guardians enable row level security;
alter table public.attendance_records enable row level security;
alter table public.daily_reports enable row level security;
alter table public.daily_activities enable row level security;
alter table public.daily_meals enable row level security;
alter table public.daily_notes enable row level security;
alter table public.contracts enable row level security;

create or replace function public.current_daycare_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select daycare_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- SECURITY DEFINER helpers: used inside RLS policies so cross-table lookups
-- bypass RLS on the referenced tables and avoid recursive policy evaluation.
create or replace function public.parent_child_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select cg.child_id
  from public.child_guardians cg
  join public.guardians g on g.id = cg.guardian_id
  where g.profile_id = auth.uid()
$$;

create or replace function public.parent_guardian_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select cg.guardian_id
  from public.child_guardians cg
  where cg.child_id in (select public.parent_child_ids())
$$;

create or replace function public.child_in_my_daycare(child uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.children c
    where c.id = child and c.daycare_id = public.current_daycare_id()
  )
$$;

create or replace function public.report_in_my_daycare(report uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.daily_reports r
    where r.id = report and r.daycare_id = public.current_daycare_id()
  )
$$;

create policy "members can read their daycare"
on public.daycares for select
using (id = public.current_daycare_id());

create policy "users can read own profile"
on public.profiles for select
using (id = auth.uid() or daycare_id = public.current_daycare_id());

create policy "teachers can manage daycare children"
on public.children for all
using (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'))
with check (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'));

create policy "parents can read linked children"
on public.children for select
using (id in (select public.parent_child_ids()));

-- Guardians ----------------------------------------------------------------
create policy "teachers can manage daycare guardians"
on public.guardians for all
using (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'))
with check (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'));

create policy "parents can read their guardians"
on public.guardians for select
using (profile_id = auth.uid() or id in (select public.parent_guardian_ids()));

-- Child <-> guardian links -------------------------------------------------
create policy "teachers can manage daycare child links"
on public.child_guardians for all
using (public.current_user_role() in ('teacher', 'admin') and public.child_in_my_daycare(child_id))
with check (public.current_user_role() in ('teacher', 'admin') and public.child_in_my_daycare(child_id));

create policy "parents can read their child links"
on public.child_guardians for select
using (child_id in (select public.parent_child_ids()));

-- Attendance ---------------------------------------------------------------
create policy "teachers can manage daycare attendance"
on public.attendance_records for all
using (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'))
with check (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'));

create policy "parents can read their child attendance"
on public.attendance_records for select
using (child_id in (select public.parent_child_ids()));

-- Daily reports and sub-tables ---------------------------------------------
create policy "members can read daycare reports"
on public.daily_reports for select
using (daycare_id = public.current_daycare_id());

create policy "teachers can manage daycare reports"
on public.daily_reports for all
using (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'))
with check (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'));

create policy "members can read daycare activities"
on public.daily_activities for select
using (public.report_in_my_daycare(report_id));

create policy "teachers can manage daycare activities"
on public.daily_activities for all
using (public.report_in_my_daycare(report_id) and public.current_user_role() in ('teacher', 'admin'))
with check (public.report_in_my_daycare(report_id) and public.current_user_role() in ('teacher', 'admin'));

create policy "members can read daycare meals"
on public.daily_meals for select
using (public.report_in_my_daycare(report_id));

create policy "teachers can manage daycare meals"
on public.daily_meals for all
using (public.report_in_my_daycare(report_id) and public.current_user_role() in ('teacher', 'admin'))
with check (public.report_in_my_daycare(report_id) and public.current_user_role() in ('teacher', 'admin'));

create policy "members can read daycare notes"
on public.daily_notes for select
using (
  public.report_in_my_daycare(report_id)
  and (
    public.current_user_role() in ('teacher', 'admin')
    or child_id is null
    or child_id in (select public.parent_child_ids())
  )
);

create policy "teachers can manage daycare notes"
on public.daily_notes for all
using (public.report_in_my_daycare(report_id) and public.current_user_role() in ('teacher', 'admin'))
with check (public.report_in_my_daycare(report_id) and public.current_user_role() in ('teacher', 'admin'));

create policy "parents can read linked contracts"
on public.contracts for select
using (child_id in (select public.parent_child_ids()));

create policy "teachers can manage daycare contracts"
on public.contracts for all
using (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'))
with check (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'));

insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;
