# Pilot QA Checklist — Production Go-Live

Run before declaring the pilot "production-perfect". App store submission is a **separate later step** (see `docs/11-release-readiness.md`).

## Automated checks

```bash
cd app
npm run typecheck
npm run lint
```

## Infrastructure

- [ ] `app/.env` is gitignored and not committed
- [ ] EAS Secrets set: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Migrations `0001`–`0006` applied in Supabase SQL Editor
- [ ] Teacher + parent auth users linked to profiles (step 5 in `12-supabase-setup.md`) — seed parent only; new parents via app invite
- [ ] Realtime enabled on `messages` table (Database → Replication)
- [ ] `invite-parent` edge function deployed
- [ ] Auth redirect URLs include `gan-nuna-banuna://reset-password`
- [ ] Production/preview build does **not** show demo role buttons

## Security / RLS

- [ ] Parent sees only their linked child(ren), contracts, broadcast messages, and own direct thread
- [ ] Parent cannot read another parent's direct thread
- [ ] Teacher sees all daycare children, attendance, reports, contracts, messages, contact messages, absence reports
- [ ] Contract PDFs open only via signed URL (private bucket + migration `0006`)

## Teacher flows (real device)

- [ ] Login with email/password
- [ ] Home stats load from Supabase
- [ ] Children list shows guardian status (מחובר / מוזמן)
- [ ] Add child + parent email → invite sent → parent can set password and log in
- [ ] Attendance save persists after reload
- [ ] Daily report: activities, meals, notes CRUD
- [ ] Contract upload + list + parent can preview PDF
- [ ] Gallery: upload photo → parent sees it in gallery
- [ ] Contact messages inbox shows parent submissions
- [ ] Absence reports inbox shows parent reports
- [ ] Broadcast message + direct message to parent
- [ ] Calendar add/edit/delete event
- [ ] Logout returns to login screen

## Parent flows (real device)

- [ ] Login after teacher invite (set password from email)
- [ ] Forgot password → email → deep link → `reset-password` screen → new password works
- [ ] Home widgets show real data (events, unread count, attendance)
- [ ] Child picker works when multiple children linked (persists after app restart)
- [ ] Daily summary: activities, meals, notes, broadcast messages
- [ ] Contract view PDF + manual sign confirmation
- [ ] Messages: broadcast + own direct thread; sender avatars visible
- [ ] Absence report saves and notifies teacher
- [ ] Contact form saves and notifies teacher
- [ ] Gallery shows uploaded photos (or empty state)

## Cross-platform

- [ ] iOS: layout RTL, bottom nav, keyboard in chat
- [ ] Android: same checks
- [ ] Realtime: second device sees new chat message without manual refresh

## Push (development build required)

- [ ] `extra.eas.projectId` set in `app.json` (after `eas init`)
- [ ] Push toggle in Settings registers token in `push_tokens`
- [ ] Edge function `send-push-notification` deployed + webhook on `notifications` INSERT
- [ ] Teacher action (e.g. message) → parent receives push when app in background

## Settings / polish

- [ ] Settings shows pilot badge ("מחובר לנתוני פיילוט")
- [ ] Email/sound toggles marked "בקרוב"
- [ ] Privacy Policy URL opens from Settings
- [ ] Terms URL opens from Settings

## Build smoke test (not store submit)

- [ ] `eas build --profile preview` succeeds (Android APK)
- [ ] `eas build --profile development` for push testing on device

## Deferred — do NOT block pilot on these

- [ ] App Store / Google Play submission
- [ ] Final hero illustrations (currently placeholders)
- [ ] Activity catalog image upload UI (manual Dashboard workflow is OK for pilot)
