# Current Project State - Gan Nuna Banuna

## Purpose

This file tracks the real implementation state of the project. Use it together with the product, UX, UI, and screen-specific documents under `docs/`.

## Product State

Gan Nuna Banuna is the first white-label mobile app for private kindergartens and home daycares.

Current phase: **production pilot** (single daycare — נונה בנונה). Supabase-backed flows are implemented; app store submission is intentionally deferred until full QA passes.

The app connects to real Supabase when `app/.env` is configured. Mock/demo login remains available only when Supabase is not configured and `EXPO_PUBLIC_ENABLE_DEMO_LOGIN=true`.

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Supabase JS client

Backend direction:

- Supabase Auth
- Supabase Database
- Supabase Storage
- Role-based access
- External digital-signature provider for contracts

## Current App Structure

Important files and folders:

```text
app/
  app/
    _layout.tsx
    index.tsx
    calendar.tsx
    profile.tsx
    settings.tsx
    notifications.tsx
    messages/
      index.tsx
      [id].tsx
    parent/
      home.tsx
      daily-summary.tsx
      absence-report.tsx
      contract-renewal.tsx
      contact.tsx
      gallery.tsx
      child.tsx
    teacher/
      home.tsx
      children.tsx
      add-child.tsx
      attendance.tsx
      daily-report.tsx
      add-activity.tsx
      add-note.tsx
      contracts.tsx
      upload-contract.tsx
      child/
        [id].tsx
  src/
    components/
    config/
      client.config.ts
    data/
    lib/
    navigation/
    services/
    theme/
    types/
    utils/
supabase/
  migrations/
```

The previous Expo template routes under `(tabs)` and `modal` were removed. The app entry screen is now `app/app/index.tsx`.

## White-Label Configuration

White-label data lives in:

- `app/src/config/client.config.ts`

Current rule:

- Screens must read client-specific branding from `CLIENT_CONFIG`.
- Screens should not hardcode the daycare name, owner name, or brand colors.
- `app/src/theme/colors.ts` reads brand colors from `CLIENT_CONFIG` and remains the style API used by components.

## Existing Components

Reusable UI components:

- `app/src/components/AppScreen.tsx`
- `app/src/components/AppCard.tsx`
- `app/src/components/AppButton.tsx`
- `app/src/components/AppTextInput.tsx`
- `app/src/components/AppStateCard.tsx`
- `app/src/components/AppHeader.tsx`
- `app/src/components/HeroBanner.tsx`
- `app/src/components/StatusBadge.tsx`
- `app/src/components/BottomNavBar.tsx`
- `app/src/components/ChildProfile.tsx`
- `app/src/navigation/useBottomNavPress.ts`

Current component notes:

- `StatusBadge` supports attendance statuses and all current contract statuses.
- `BottomNavBar` supports separate parent and teacher variants and renders real `@expo/vector-icons` (Ionicons).
- `useBottomNavPress` centralizes bottom navigation routes for parent and teacher screens, including the shared `calendar`, `profile`, and `settings` destinations.
- `ChildProfile` renders the full child card (avatar, status badges, details, guardians with quick-call) and is shared by the parent child screen and the teacher child screen.
- `AppHeader` renders the top menu/back button plus the notification bell with a badge, used as an overlay on top of `HeroBanner`.
- `HeroBanner` renders a full-width hero illustration with optional title/subtitle and overlay children, sourced from `app/src/theme/heroes.ts`.

## Hero Assets

Reference hero illustrations are mapped in `app/src/theme/heroes.ts` and stored under `app/assets/heroes/`:

- `login.png`, `parent-home.png`, `teacher-home.png`, `children.png`, `attendance.png`, `daily-summary.png`, `teacher-contracts.png`, `upload-contract.png`, `parent-contract.png`.
- These files are currently temporary placeholders (a copy of the app icon) so the bundle builds. They must be replaced with the cropped hero regions from `assets/design-references/` (same file names) for full visual fidelity.

## Existing Data

Mock data lives under:

- `app/src/data/mockChildren.ts`
- `app/src/data/mockContracts.ts`
- `app/src/data/mockDailyReports.ts`
- `app/src/data/mockParent.ts`
- `app/src/data/mockParentHome.ts`
- `app/src/data/mockNotifications.ts`
- `app/src/data/mockMessages.ts`
- `app/src/data/mockCalendar.ts`

Screen data access now goes through services under:

- `app/src/services/auth.service.ts`
- `app/src/services/children.service.ts`
- `app/src/services/contracts.service.ts`
- `app/src/services/dailyReports.service.ts`
- `app/src/services/attendance.service.ts`
- `app/src/services/gallery.service.ts`
- `app/src/services/absence.service.ts`
- `app/src/services/contact.service.ts`
- `app/src/services/push.service.ts`
- `app/src/services/invite.service.ts`
- `app/src/services/parentHome.service.ts`
- `app/src/services/pilot.service.ts`
- `app/src/services/notifications.service.ts`
- `app/src/services/messages.service.ts`
- `app/src/services/calendar.service.ts`

Supabase setup files:

- `app/src/lib/supabase.ts`
- `app/.env.example`
- `supabase/migrations/0001_pilot_foundation.sql` through `0006_storage_contracts.sql`
- `supabase/functions/invite-parent/`
- `supabase/functions/send-push-notification/`

Shared types live under:

- `app/src/types/child.ts`
- `app/src/types/contract.ts`
- `app/src/types/user.ts`

## Existing Screens

### Login / Entry

File: `app/app/index.tsx`

Status:

- Email/password login via Supabase Auth when configured.
- Forgot password sends reset email with deep link to `app/app/reset-password.tsx`.
- Demo role buttons only when Supabase is not configured.

### Parent Home

File: `app/app/parent/home.tsx`

Status:

- Wired to Supabase via services (child, contract, activities, stats, photos, messages).
- Child picker when parent has multiple linked children (persisted in AsyncStorage).
- Quick actions: contact, contracts, calendar, profile.

### Teacher flows (high level)

- **Add child** (`add-child.tsx`): persists to DB; invites parent by email via `invite-parent` edge function.
- **Gallery** (`teacher/gallery.tsx`): upload photos with `expo-image-picker`.
- **Contact inbox** (`teacher/contact-messages.tsx`): reads `contact_messages`.
- **Absence reports** (`teacher/absence-reports.tsx`): reads `absence_reports`.
- **Children list**: shows guardian link status (מחובר / מוזמן).

### Messaging

- Broadcast + direct threads; sender avatars; Supabase Realtime subscription in chat (requires Replication enabled in Dashboard).

### Not yet / manual

- App Store / Play Store submission (deferred — see `docs/11-release-readiness.md`).
- Hero images are still placeholders under `app/assets/heroes/`.
- Activity catalog images: manual upload via Dashboard (documented in `12-supabase-setup.md`).
- Push: client ready; requires EAS project ID + deployed edge function + webhook + dev build to test.

## Legacy screen notes (may be partially outdated below)

### Parent Daily Summary

File:

- `app/app/parent/daily-summary.tsx`

Status:

- Shows summary counts, activities, meals, messages, and notes through `dailyReports.service`.
- Uses `BottomNavBar` with the parent variant and shared bottom-nav routing.
- No parent-specific filtering yet.

### Parent Absence / Quick Report

File:

- `app/app/parent/absence-report.tsx`

Status:

- Added as a soft "דיווח מהיר לגננת" flow.
- Lets the parent choose absence / late arrival / early pickup / request callback.
- Shows child and date through the service layer.
- Uses local mock behavior only; no real message is sent.
- Keeps the product direction that personal communication with the daycare is still important.

### Parent Contract Renewal

File:

- `app/app/parent/contract-renewal.tsx`

Status:

- Shows the parent's pending contract through `contracts.service`.
- Shows child summary, contract status, details, document card, and signature action card.
- PDF preview and digital signature are placeholder alerts only.
- Uses `CLIENT_CONFIG` for daycare branding.

### Teacher Home

File:

- `app/app/teacher/home.tsx`

Status:

- Shows greeting from `CLIENT_CONFIG.ownerName`.
- Shows daycare name from `CLIENT_CONFIG.daycareName`.
- Shows child count, daily summary and contract reminder through services.
- Quick actions navigate to teacher children, attendance, daily report, contracts and upload contract.
- Uses `BottomNavBar` with the teacher variant and shared bottom-nav routing.

### Teacher Children

File:

- `app/app/teacher/children.tsx`

Status:

- Shows children list through `children.service` with local search.
- Shows attendance and contract status badges.
- Shows summary counts and empty search state.
- Each child row navigates to `/teacher/child/[id]`.
- Navigates to `/teacher/add-child`.

### Teacher Add Child

File:

- `app/app/teacher/add-child.tsx`

Status:

- Form screen with child details, parent/guardian details, notes, phone validation and optional email validation.
- Image upload and save are mock behavior only.
- Returns to the children list after the success alert.

### Teacher Attendance

File:

- `app/app/teacher/attendance.tsx`

Status:

- Shows children through `children.service`.
- Allows local status selection for arrived / not arrived / late / left early.
- Summary card updates locally.
- Save action shows a mock success alert.

### Teacher Daily Report

File:

- `app/app/teacher/daily-report.tsx`

Status:

- Shows daily summary counts, activities, meals, messages, and notes through `dailyReports.service`.
- "הוספת פעילות" navigates to `/teacher/add-activity`, "הוספת הערה" to `/teacher/add-note`, and "צפייה בכל ההודעות" to `/messages`.

### Teacher Contracts

File:

- `app/app/teacher/contracts.tsx`

Status:

- Shows contract summary, local search, and contract list through `contracts.service`.
- Uses `StatusBadge` for contract status.
- Each contract row navigates to `/teacher/child/[id]`.
- Navigates to `/teacher/upload-contract`.

### Teacher Upload Contract

File:

- `app/app/teacher/upload-contract.tsx`

Status:

- Full multi-step flow: contract details, parent/child selection, preview, and send-to-sign confirmation.
- Includes contract type chips, PDF placeholder, step indicator, and per-step validation.
- No real PDF upload, storage, email, or signing provider integration yet.

### Shared Navigation Screens

Files:

- `app/app/calendar.tsx`, `app/app/profile.tsx`, `app/app/settings.tsx`, `app/app/notifications.tsx`

Status:

- Role-aware: each reads `auth.service` to render the correct parent/teacher bottom nav variant.
- `calendar` lists upcoming events from `calendar.service`.
- `profile` shows the current user details plus a menu to messages, calendar, notifications, and settings.
- `settings` has notification toggles (local state), general info rows, and a demo logout returning to the entry screen.
- `notifications` lists items from `notifications.service` with read/unread styling; reached from the header bell on every screen.

### Messages

Files:

- `app/app/messages/index.tsx` (thread list), `app/app/messages/[id].tsx` (conversation)

Status:

- Thread list and conversation bubbles come from `messages.service`.
- The conversation screen has a working composer that appends messages locally (no backend send yet).

### Parent Contact / Gallery / Child

Files:

- `app/app/parent/contact.tsx`, `app/app/parent/gallery.tsx`, `app/app/parent/child.tsx`

Status:

- `contact` offers call / WhatsApp / email quick actions (via `Linking`), contact details, and a demo message form.
- `gallery` shows a photo grid from `parentHome.service` (placeholder tiles).
- `child` renders the shared `ChildProfile` for the current parent's child.

### Teacher Child / Add Activity / Add Note

Files:

- `app/app/teacher/child/[id].tsx`, `app/app/teacher/add-activity.tsx`, `app/app/teacher/add-note.tsx`

Status:

- `child/[id]` renders the shared `ChildProfile` with quick links to daily report and contracts.
- `add-activity` and `add-note` are demo forms (category/type chips, validation) that show a success alert and return.

## Remaining MVP Screens

All planned frontend MVP screens, including every bottom-nav destination and the previously "coming soon" flows, now exist with mock data. No user-facing placeholders remain.

## Current Next Steps

Recommended order:

1. Replace placeholder hero images under `app/assets/heroes/` with the real cropped illustrations from `assets/design-references/`.
2. Run `npm run typecheck`.
3. Run `npm run lint`.
4. Review MVP screens visually on web/mobile.
5. Fix spacing/RTL issues found during visual QA.
6. Configure a real Supabase project and copy values into `app/.env`.
6. Run the migration under `supabase/migrations/0001_pilot_foundation.sql`.
7. Replace service internals with Supabase queries while keeping screen APIs stable.

## Production Readiness Notes

Before production, the project still needs:

- Real Supabase project credentials
- Real authentication flow
- Full screen-level Supabase query wiring
- Full RLS policy review with real pilot users
- Production Privacy Policy / Terms URLs
- Final app icon, splash and store screenshots
- Privacy and security review
- Contract workflow design
- External digital-signature provider integration

## Verification Notes

Current verification commands:

- `npm run typecheck`
- `npm run lint`

Known dependency note:

- `npm audit --audit-level=moderate` currently reports moderate vulnerabilities through Expo's dependency tree (`postcss`, `uuid`).
- The available automatic fix requires `npm audit fix --force`, which would upgrade Expo to a breaking major version.
- Do not run the forced audit fix as part of MVP screen work. Plan an Expo upgrade separately.

## Working Rules

- Keep screens under `app/app/`.
- Keep reusable components under `app/src/components/`.
- Keep client configuration under `app/src/config/`.
- Keep mock data under `app/src/data/`.
- Keep screen data access under `app/src/services/`.
- Keep shared types under `app/src/types/`.
- Keep theme primitives under `app/src/theme/`.
- Build UI first, then services, then backend integration.
- Do not introduce new hardcoded client branding in screens.
- Do not commit unless explicitly requested.
