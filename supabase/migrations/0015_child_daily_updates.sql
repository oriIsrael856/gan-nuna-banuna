-- Per-child daily update (meals, nap, mood, diapers, note).
-- Staff write; only the child's own parents can read it.

create table public.child_daily_updates (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  update_date date not null default current_date,
  meal_breakfast text check (meal_breakfast in ('all', 'most', 'some', 'none')),
  meal_lunch text check (meal_lunch in ('all', 'most', 'some', 'none')),
  meal_snack text check (meal_snack in ('all', 'most', 'some', 'none')),
  nap_start time,
  nap_end time,
  mood text check (mood in ('happy', 'calm', 'tired', 'upset')),
  diaper_count integer check (diaper_count is null or diaper_count >= 0),
  note text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, update_date)
);

create index child_daily_updates_lookup_idx
  on public.child_daily_updates (daycare_id, update_date, child_id);

alter table public.child_daily_updates enable row level security;

create policy "teachers manage child daily updates"
on public.child_daily_updates for all
using (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() in ('teacher', 'admin')
)
with check (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() in ('teacher', 'admin')
);

create policy "parents read their child daily updates"
on public.child_daily_updates for select
using (child_id in (select public.parent_child_ids()));
