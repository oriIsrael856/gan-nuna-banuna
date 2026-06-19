-- Production pilot features: gallery, absence reports, contact messages, push tokens.
-- Depends on 0001–0004.

-- Gallery photos -------------------------------------------------------------
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  image_path text not null,
  label text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index gallery_photos_daycare_id_idx on public.gallery_photos(daycare_id);

-- Absence reports ------------------------------------------------------------
create table public.absence_reports (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  report_date date not null default current_date,
  report_type text not null,
  note text,
  reported_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index absence_reports_child_date_idx on public.absence_reports(child_id, report_date);

-- Contact form messages ------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  subject text,
  body text not null,
  created_at timestamptz not null default now()
);

create index contact_messages_daycare_id_idx on public.contact_messages(daycare_id);

-- Push notification device tokens --------------------------------------------
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text,
  created_at timestamptz not null default now(),
  unique (profile_id, token)
);

-- Gallery storage bucket (public read for parent gallery) --------------------
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- RLS ------------------------------------------------------------------------
alter table public.gallery_photos enable row level security;
alter table public.absence_reports enable row level security;
alter table public.contact_messages enable row level security;
alter table public.push_tokens enable row level security;

-- Gallery: daycare members read; teachers upload/delete
create policy "members read gallery photos"
on public.gallery_photos for select
using (daycare_id = public.current_daycare_id());

create policy "teachers manage gallery photos"
on public.gallery_photos for all
using (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() in ('teacher', 'admin')
)
with check (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() in ('teacher', 'admin')
);

-- Absence: parents insert for their children; teachers read all in daycare
create policy "parents insert absence for own child"
on public.absence_reports for insert
with check (
  daycare_id = public.current_daycare_id()
  and child_id in (select public.parent_child_ids())
);

create policy "members read absence reports"
on public.absence_reports for select
using (
  daycare_id = public.current_daycare_id()
  and (
    public.current_user_role() in ('teacher', 'admin')
    or child_id in (select public.parent_child_ids())
  )
);

-- Contact: parents insert; teachers read
create policy "parents send contact messages"
on public.contact_messages for insert
with check (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() = 'parent'
);

create policy "teachers read contact messages"
on public.contact_messages for select
using (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() in ('teacher', 'admin')
);

-- Push tokens: users manage their own tokens
create policy "users manage own push tokens"
on public.push_tokens for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

-- Storage policies for gallery bucket ----------------------------------------
create policy "gallery public read"
on storage.objects for select
using (bucket_id = 'gallery');

create policy "teachers upload gallery"
on storage.objects for insert
with check (
  bucket_id = 'gallery'
  and public.current_user_role() in ('teacher', 'admin')
);

create policy "teachers delete gallery"
on storage.objects for delete
using (
  bucket_id = 'gallery'
  and public.current_user_role() in ('teacher', 'admin')
);
