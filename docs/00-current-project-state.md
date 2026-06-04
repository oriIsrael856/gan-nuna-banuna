# Current Project State - Gan Nuna Banuna

## Purpose

This file tracks the real implementation state of the project. Use it together with the product, UX, UI, and screen-specific documents under `docs/`.

## Product State

Gan Nuna Banuna is the first white-label mobile app for private kindergartens and home daycares.

Current phase: frontend MVP with mock data only.

The app is not production-ready yet.

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router

Future backend direction:

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
    parent/
      home.tsx
      daily-summary.tsx
    teacher/
      home.tsx
  src/
    components/
    config/
      client.config.ts
    data/
    theme/
    types/
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
- `app/src/components/StatusBadge.tsx`
- `app/src/components/BottomNavBar.tsx`

Current component notes:

- `StatusBadge` supports attendance statuses and all current contract statuses.
- `BottomNavBar` supports separate parent and teacher variants.

## Existing Data

Mock data lives under:

- `app/src/data/mockChildren.ts`
- `app/src/data/mockContracts.ts`
- `app/src/data/mockDailyReports.ts`
- `app/src/data/mockParent.ts`

Shared types live under:

- `app/src/types/child.ts`
- `app/src/types/contract.ts`
- `app/src/types/user.ts`

## Existing Screens

### Login / Entry

File:

- `app/app/index.tsx`

Status:

- Works as the app entry screen.
- Allows demo navigation to parent home and teacher home.
- Uses `CLIENT_CONFIG` for daycare branding.
- No real authentication yet.

### Parent Home

File:

- `app/app/parent/home.tsx`

Status:

- Shows parent greeting from `mockParent`.
- Shows child info from `mockChildren`.
- Uses `CLIENT_CONFIG` for daycare branding.
- Shows daily summary counts from `mockDailyReportSummary`.
- Shows contract reminder from `mockContracts`.
- "סיכום יום" navigates to `/parent/daily-summary`.
- "חוזים ומסמכים" and "יצירת קשר עם הגן" are placeholders until their flows exist.
- Uses `BottomNavBar` with the parent variant.

### Parent Daily Summary

File:

- `app/app/parent/daily-summary.tsx`

Status:

- Shows summary counts, activities, meals, messages, and notes from `mockDailyReports`.
- Uses `BottomNavBar` with the parent variant.
- No parent-specific filtering yet.

### Teacher Home

File:

- `app/app/teacher/home.tsx`

Status:

- Shows greeting from `CLIENT_CONFIG.ownerName`.
- Shows daycare name from `CLIENT_CONFIG.daycareName`.
- Shows child count from `mockChildren`.
- Shows present count from `mockDailyReportSummary`.
- Quick actions are still placeholders until the teacher screens exist.
- Uses `BottomNavBar` with the teacher variant.

## Remaining MVP Screens

Still missing:

- `app/app/teacher/children.tsx`
- `app/app/teacher/add-child.tsx`
- `app/app/teacher/attendance.tsx`
- `app/app/teacher/daily-report.tsx`
- `app/app/teacher/contracts.tsx`
- `app/app/teacher/upload-contract.tsx`
- `app/app/parent/absence-report.tsx`
- `app/app/parent/contract-renewal.tsx`

## Current Next Steps

Recommended order:

1. Run `npm install` inside `app/` if dependencies are missing.
2. Run `npm run typecheck`.
3. Build teacher children list.
4. Build teacher add-child form.
5. Build teacher attendance.
6. Build teacher daily report.
7. Build parent absence report.
8. Build teacher contracts and upload-contract.
9. Build parent contract-renewal.
10. Replace mock data with backend services in a later phase.

## Production Readiness Notes

Before production, the project still needs:

- Real authentication
- Role-based permissions
- Backend/database
- Secure storage
- Error handling
- Loading states
- Empty states
- Form validation
- Environment variables
- Production build configuration
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
- Keep shared types under `app/src/types/`.
- Keep theme primitives under `app/src/theme/`.
- Build UI first, then mock data, then backend.
- Do not introduce new hardcoded client branding in screens.
- Do not commit unless explicitly requested.
