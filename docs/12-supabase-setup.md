# Supabase Setup Guide (Pilot)

Follow these steps once to connect the app to a real Supabase backend. After this, every screen reads and writes real data. Until `app/.env` is filled in, the app keeps running on mock data.

## 1. Create the project

1. Go to https://supabase.com and sign in (free tier is enough).
2. Click "New project". Choose a name (e.g. `gan-nuna-banuna`), a strong database password, and the closest region.
3. Wait for the project to finish provisioning (1-2 minutes).

## 2. Copy the API keys into the app

1. In the dashboard go to Project Settings > API.
2. Copy the `Project URL` and the `anon` `public` key.
3. Create the file `app/.env` (next to `app/.env.example`) with:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

4. Restart the dev server after creating `.env` (stop it and run `npx expo start -c` to clear the cache).

## 3. Create the database schema

In the dashboard open SQL Editor > New query, then run these files in order (copy-paste the file contents and click Run):

1. `supabase/migrations/0001_pilot_foundation.sql`
2. `supabase/migrations/0002_messaging_events.sql`
3. `supabase/migrations/0003_seed_pilot.sql`
4. `supabase/migrations/0004_crud_catalog_messaging.sql`
5. `supabase/migrations/0005_production_features.sql`
6. `supabase/migrations/0006_storage_contracts.sql`

After step 3 you have the Gan Nuna Banuna daycare, 7 children, guardians, contracts, today's attendance + daily report, a message thread, notifications, and calendar events.

After step 4 you also have: activity catalog (16 pre-seeded activities), private/broadcast messaging columns, tightened parent thread visibility, per-recipient notification read policies, and the public `activity-images` storage bucket.

After step 5 you also have: `gallery_photos` + public `gallery` bucket, `absence_reports`, `contact_messages`, and `push_tokens` for device notifications.

After step 6 you also have: Storage RLS policies on the private `contracts` bucket (teacher upload/read/delete; parent read for linked children). Without this migration, contract PDF upload and preview may fail silently.

## 4. Create the pilot users (auth)

Go to Authentication > Users > "Add user" and create two users (email + password, mark "Auto confirm"):

- Teacher: e.g. `teacher@gan-nuna.co.il`
- Parent: e.g. `rachel.cohen@example.com`

You do NOT need to copy the User UID manually — the SQL in step 5 looks each user up by email.

## 5. Link the users to profiles

A profile's `id` must equal the auth user's UID (a UUID), not the email. Instead of copying UIDs by hand (easy to mistype), let SQL resolve them from the email. In SQL Editor, run the block below — replace only the two email addresses if yours differ from step 4:

```sql
-- Teacher profile (owner)
insert into public.profiles (id, daycare_id, role, full_name, phone)
values (
  (select id from auth.users where email = 'teacher@gan-nuna.co.il'),
  '11111111-1111-1111-1111-111111111111', 'teacher', 'נונה', null
)
on conflict (id) do update
  set daycare_id = excluded.daycare_id, role = excluded.role, full_name = excluded.full_name;

-- Parent profile (Rachel Cohen, mother of Noa)
insert into public.profiles (id, daycare_id, role, full_name, phone)
values (
  (select id from auth.users where email = 'rachel.cohen@example.com'),
  '11111111-1111-1111-1111-111111111111', 'parent', 'רחל כהן', '050-1234567'
)
on conflict (id) do update
  set daycare_id = excluded.daycare_id, role = excluded.role, full_name = excluded.full_name;

-- Link the parent profile to their guardian record so RLS lets them see their child + contract
update public.guardians
  set profile_id = (select id from auth.users where email = 'rachel.cohen@example.com')
  where id = 'b0000000-0000-0000-0000-000000000001';
```

Notes:
- The email in each `select` must exactly match the email you used in step 4, otherwise the subquery returns `NULL` and the insert fails.
- The parent email must be identical in both the parent `insert` and the `guardians` update so the profile and guardian link to the same user.

## 6. Manual dashboard steps

### Realtime messaging

1. Supabase Dashboard → **Database → Replication**.
2. Enable replication for the `messages` table.
3. Test: send a message on one device; it should appear on another without refresh.

### Parent onboarding from the app (no manual SQL)

When a teacher adds a child with a parent email in the app, the `invite-parent` Edge Function:

1. Invites the parent via Supabase Auth (`inviteUserByEmail`).
2. Creates/updates their `profiles` row (`role = parent`).
3. Links `guardians.profile_id` to the auth user.

Deploy once:

```bash
supabase functions deploy invite-parent
```

Set secrets (Dashboard → Edge Functions → invite-parent → Secrets):

- `SUPABASE_SERVICE_ROLE_KEY` (auto-injected when deployed via CLI)
- `INVITE_REDIRECT_URL` = `gan-nuna-banuna://reset-password` (or your production deep link)

In **Authentication → URL Configuration**, add redirect URLs:

- `gan-nuna-banuna://reset-password`
- `gan-nuna-banuna://**`

### Push notifications

1. Run `eas init` in `app/` and copy the project ID into `app.json` → `extra.eas.projectId`.
2. Deploy: `supabase functions deploy send-push-notification`
3. Set secret `EXPO_ACCESS_TOKEN` (from expo.dev account settings).
4. Dashboard → **Database → Webhooks** → new webhook on `notifications` INSERT → call `send-push-notification`.
5. Push requires a **development build** or production build (not Expo Go). Test with `eas build --profile development`.

## 7. Verify

1. In the app, the entry screen now shows email/password login.
2. Log in as the teacher: you should see the real children, attendance, daily report, and contracts.
3. Log in as the parent: you should see only Noa, her contract, and the daycare messages/notifications/calendar.
4. The teacher home/settings should show "מחובר לנתוני פיילוט" instead of "מצב דמו".

## Notes

- Adding a child / saving attendance / adding activities and notes / creating a contract now persist to Supabase and survive reload.
- Row Level Security is enabled. Teachers/admins manage their daycare data; parents can only read their linked child and contracts.
- Contract PDF upload: the teacher upload screen now picks a real PDF and uploads it to the private `contracts` storage bucket (`<daycare_id>/<child_id>/<timestamp>-<name>.pdf`), storing the object path in `contracts.file_path`. The parent contract screen fetches a short-lived signed URL to preview it.
  - The `contracts` bucket is created automatically by migration `0001`. No public access is granted; only signed URLs are used.
  - Digital signature via an external provider remains a later stage.
- **Activity catalog images:** migration `0004` creates the public `activity-images` bucket and seeds `activity_catalog` rows (titles only; `image_path` is null until you upload files). To add images later:
  1. In Supabase Dashboard go to **Storage > activity-images**.
  2. Upload one image per activity (e.g. `morning-circle.jpg`).
  3. In SQL Editor, set the path on the matching catalog row, e.g. `update public.activity_catalog set image_path = 'morning-circle.jpg' where title = 'מפגש בוקר';`
  4. The app shows the image in the activity picker, daily report, and parent daily summary (placeholder icon until a path is set).
- **Private messaging:** teachers can start a broadcast thread (all parents) or a direct thread (one parent) from the Messages screen. Parents only see broadcast threads plus their own direct thread (enforced by RLS in `0004`).
- **Notifications:** the bell badge updates globally via `NotificationsProvider`; opening the notifications screen marks all as read and clears the counter.
- **Production builds:** set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as EAS Secrets for `preview` and `production` profiles. Demo login is disabled in those builds (`EXPO_PUBLIC_ENABLE_DEMO_LOGIN=false` in `eas.json`).
- **Push notifications:** the app registers Expo push tokens when enabled in Settings. Deploy `send-push-notification` and wire a Database Webhook on `notifications` INSERT (see section 6 above). Requires EAS project ID in `app.json`.
- **Parent invite:** teachers add children with email → `invite-parent` edge function sends auth invite. No manual SQL for new parents.
- **Password reset:** forgot-password sends email with deep link to `reset-password` screen.
- **Realtime messaging:** enable replication for `messages` in Dashboard (see section 6).
