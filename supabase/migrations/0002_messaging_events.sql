-- Messaging, notifications and calendar events for the pilot.
-- Depends on 0001_pilot_foundation.sql (daycares, profiles, helper functions).

create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  title text not null,
  subtitle text,
  avatar_initial text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  type text not null default 'message',
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  title text not null,
  event_date date not null,
  event_time text,
  type text not null default 'event',
  created_at timestamptz not null default now()
);

create index messages_thread_id_idx on public.messages(thread_id);
create index message_threads_daycare_id_idx on public.message_threads(daycare_id);
create index notifications_daycare_id_idx on public.notifications(daycare_id);
create index calendar_events_daycare_id_idx on public.calendar_events(daycare_id);

alter table public.message_threads enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.calendar_events enable row level security;

-- Threads: any member of the daycare can read; teachers/admins manage.
create policy "members can read daycare threads"
on public.message_threads for select
using (daycare_id = public.current_daycare_id());

create policy "teachers can manage daycare threads"
on public.message_threads for all
using (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'))
with check (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'));

-- Messages: readable by members of the thread's daycare; any member can send.
create policy "members can read daycare messages"
on public.messages for select
using (
  exists (
    select 1 from public.message_threads t
    where t.id = messages.thread_id
      and t.daycare_id = public.current_daycare_id()
  )
);

create policy "members can send messages"
on public.messages for insert
with check (
  exists (
    select 1 from public.message_threads t
    where t.id = messages.thread_id
      and t.daycare_id = public.current_daycare_id()
  )
);

create policy "members can update message read state"
on public.messages for update
using (
  exists (
    select 1 from public.message_threads t
    where t.id = messages.thread_id
      and t.daycare_id = public.current_daycare_id()
  )
);

-- Notifications: recipient sees their own; broadcast (null recipient) seen by all daycare members.
create policy "members can read daycare notifications"
on public.notifications for select
using (
  daycare_id = public.current_daycare_id()
  and (recipient_id is null or recipient_id = auth.uid())
);

create policy "teachers can manage daycare notifications"
on public.notifications for all
using (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'))
with check (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'));

-- Calendar: members read; teachers/admins manage.
create policy "members can read daycare events"
on public.calendar_events for select
using (daycare_id = public.current_daycare_id());

create policy "teachers can manage daycare events"
on public.calendar_events for all
using (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'))
with check (daycare_id = public.current_daycare_id() and public.current_user_role() in ('teacher', 'admin'));
