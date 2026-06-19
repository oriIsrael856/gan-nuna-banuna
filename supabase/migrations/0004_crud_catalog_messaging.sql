-- CRUD support: activity catalog + images, private/broadcast messaging,
-- and recipient-managed notifications.
-- Depends on 0001_pilot_foundation.sql and 0002_messaging_events.sql.

-- ---------------------------------------------------------------------------
-- Activity catalog (global, read-only in app; images supplied later)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_catalog (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  image_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.activity_catalog enable row level security;

create policy "authenticated can read activity catalog"
on public.activity_catalog for select
using (auth.uid() is not null);

insert into public.activity_catalog (title, category, sort_order) values
  ('מפגש בוקר', 'learning', 10),
  ('סיפור וקריאה', 'story', 20),
  ('יצירה ואומנות', 'creative', 30),
  ('משחק חופשי', 'learning', 40),
  ('פעילות תנועה', 'movement', 50),
  ('מוזיקה וריקוד', 'movement', 60),
  ('משחק בחצר', 'outdoor', 70),
  ('ארוחת בוקר', 'learning', 80),
  ('ארוחת צהריים', 'learning', 90),
  ('מנוחה', 'learning', 100),
  ('פעילות חושית', 'creative', 110),
  ('משחקי קוביות', 'learning', 120),
  ('גינון', 'outdoor', 130),
  ('בישול ואפייה', 'creative', 140),
  ('חוג העשרה', 'learning', 150),
  ('פעילות מים', 'outdoor', 160)
on conflict do nothing;

-- Link daily activities to the catalog (free-text activities still allowed).
alter table public.daily_activities
  add column if not exists catalog_id uuid references public.activity_catalog(id) on delete set null;

-- Public bucket for catalog illustrations (generic, non-sensitive).
insert into storage.buckets (id, name, public)
values ('activity-images', 'activity-images', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Messaging: broadcast vs private (direct) threads
-- ---------------------------------------------------------------------------
alter table public.message_threads
  add column if not exists kind text not null default 'broadcast';
alter table public.message_threads
  add column if not exists parent_profile_id uuid references public.profiles(id) on delete cascade;

create index if not exists message_threads_parent_idx
  on public.message_threads(parent_profile_id);

create or replace function public.thread_visible_to_me(thread uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.message_threads t
    where t.id = thread
      and t.daycare_id = public.current_daycare_id()
      and (
        public.current_user_role() in ('teacher', 'admin')
        or t.kind = 'broadcast'
        or t.parent_profile_id = auth.uid()
      )
  )
$$;

-- Replace the over-permissive thread read policy: parents now only see
-- broadcast threads or their own direct thread.
drop policy if exists "members can read daycare threads" on public.message_threads;
create policy "members can read visible threads"
on public.message_threads for select
using (
  daycare_id = public.current_daycare_id()
  and (
    public.current_user_role() in ('teacher', 'admin')
    or kind = 'broadcast'
    or parent_profile_id = auth.uid()
  )
);

-- Messages: scope read/insert/update to threads the user can actually see.
drop policy if exists "members can read daycare messages" on public.messages;
create policy "members can read visible messages"
on public.messages for select
using (public.thread_visible_to_me(thread_id));

drop policy if exists "members can send messages" on public.messages;
create policy "members can send visible messages"
on public.messages for insert
with check (public.thread_visible_to_me(thread_id));

drop policy if exists "members can update message read state" on public.messages;
create policy "members can update visible message read state"
on public.messages for update
using (public.thread_visible_to_me(thread_id));

-- ---------------------------------------------------------------------------
-- Notifications: recipients manage their own read state; members may create
-- notifications addressed within their daycare (e.g. message alerts).
-- ---------------------------------------------------------------------------
drop policy if exists "recipients can update own notifications" on public.notifications;
create policy "recipients can update own notifications"
on public.notifications for update
using (
  daycare_id = public.current_daycare_id()
  and (recipient_id = auth.uid() or recipient_id is null)
)
with check (daycare_id = public.current_daycare_id());

-- Ensure seeded broadcast thread is tagged correctly (runs after 0003).
update public.message_threads
  set kind = 'broadcast'
  where kind is null or kind = '';

create policy "members can create daycare notifications"
on public.notifications for insert
with check (daycare_id = public.current_daycare_id());
