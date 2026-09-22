-- Staff time clock: each row is one shift (clock in, optional clock out).
-- Staff manage their own rows; the daycare admin can read everyone's.

create table public.staff_time_entries (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  created_at timestamptz not null default now(),
  constraint staff_time_entries_out_after_in check (clock_out is null or clock_out >= clock_in)
);

create index staff_time_entries_lookup_idx
  on public.staff_time_entries (daycare_id, profile_id, clock_in desc);

alter table public.staff_time_entries enable row level security;

create policy "staff manage own time entries"
on public.staff_time_entries for all
using (
  profile_id = auth.uid()
  and daycare_id = public.current_daycare_id()
  and public.current_user_role() in ('teacher', 'admin')
)
with check (
  profile_id = auth.uid()
  and daycare_id = public.current_daycare_id()
  and public.current_user_role() in ('teacher', 'admin')
);

create policy "admin reads daycare time entries"
on public.staff_time_entries for select
using (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() = 'admin'
);
