-- Daycare setup: settings, hero images, branding storage, RLS for admin management.

create table public.daycare_settings (
  daycare_id uuid primary key references public.daycares(id) on delete cascade,
  owner_name text,
  tagline text,
  subtitle text,
  primary_color text,
  secondary_color text,
  background_color text,
  card_background_color text,
  text_primary_color text,
  text_secondary_color text,
  support_phone text,
  support_email text,
  logo_url text,
  setup_completed boolean not null default false,
  setup_completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.daycare_hero_images (
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  hero_key text not null,
  storage_path text not null,
  updated_at timestamptz not null default now(),
  primary key (daycare_id, hero_key)
);

create index daycare_hero_images_daycare_id_idx on public.daycare_hero_images(daycare_id);

alter table public.daycare_settings enable row level security;
alter table public.daycare_hero_images enable row level security;

-- Daycares: admins can update their daycare name.
create policy "admins update their daycare"
on public.daycares for update
using (
  id = public.current_daycare_id()
  and public.current_user_role() = 'admin'
)
with check (
  id = public.current_daycare_id()
  and public.current_user_role() = 'admin'
);

-- Settings: all daycare members read; admin full CRUD.
create policy "members read daycare settings"
on public.daycare_settings for select
using (daycare_id = public.current_daycare_id());

create policy "admins manage daycare settings"
on public.daycare_settings for all
using (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() = 'admin'
)
with check (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() = 'admin'
);

-- Hero images: members read; admin manage.
create policy "members read daycare heroes"
on public.daycare_hero_images for select
using (daycare_id = public.current_daycare_id());

create policy "admins manage daycare heroes"
on public.daycare_hero_images for all
using (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() = 'admin'
)
with check (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() = 'admin'
);

-- Admins can read staff profiles in their daycare.
create policy "admins read daycare staff profiles"
on public.profiles for select
using (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() = 'admin'
  and role in ('teacher', 'admin')
);

create policy "admins delete teacher profiles"
on public.profiles for delete
using (
  daycare_id = public.current_daycare_id()
  and public.current_user_role() = 'admin'
  and role = 'teacher'
  and id <> auth.uid()
);

-- Branding storage bucket (public read for hero images).
insert into storage.buckets (id, name, public)
values ('daycare-branding', 'daycare-branding', true)
on conflict (id) do nothing;

create policy "members read daycare branding"
on storage.objects for select
using (
  bucket_id = 'daycare-branding'
  and (storage.foldername(name))[1] = public.current_daycare_id()::text
);

create policy "public read daycare branding"
on storage.objects for select
using (bucket_id = 'daycare-branding');

create policy "admins upload daycare branding"
on storage.objects for insert
with check (
  bucket_id = 'daycare-branding'
  and public.current_user_role() = 'admin'
  and (storage.foldername(name))[1] = public.current_daycare_id()::text
);

create policy "admins update daycare branding"
on storage.objects for update
using (
  bucket_id = 'daycare-branding'
  and public.current_user_role() = 'admin'
  and (storage.foldername(name))[1] = public.current_daycare_id()::text
);

create policy "admins delete daycare branding"
on storage.objects for delete
using (
  bucket_id = 'daycare-branding'
  and public.current_user_role() = 'admin'
  and (storage.foldername(name))[1] = public.current_daycare_id()::text
);

-- Pilot daycare: mark setup as completed with default branding.
insert into public.daycare_settings (
  daycare_id,
  owner_name,
  tagline,
  subtitle,
  primary_color,
  secondary_color,
  background_color,
  card_background_color,
  text_primary_color,
  text_secondary_color,
  support_phone,
  support_email,
  setup_completed,
  setup_completed_at
)
values (
  '11111111-1111-1111-1111-111111111111',
  'נונה',
  'כל מה שהגננת וההורים צריכים, במקום אחד',
  'האפליקציה האישית של הגן',
  '#7A9A72',
  '#F4D6C6',
  '#FFF8F1',
  '#FFFFFF',
  '#26382E',
  '#6B6B6B',
  '03-1234567',
  'info@gan-nuna.co.il',
  true,
  now()
)
on conflict (daycare_id) do nothing;
