# Security, Privacy and QA

## Pilot Data Rules

- Parent users must only see children linked to their guardian profile.
- Teacher users may access children, attendance, daily reports and contracts only within their daycare.
- Contract PDFs must be stored in a private Supabase Storage bucket.
- Digital signature must be handled by an external provider, not implemented inside the app.

## Required States

Every production-connected screen should include:

- Loading state while fetching data.
- Empty state when no records exist.
- Error state with a retry action when fetch or upload fails.
- Form validation before write actions.

## Manual QA Checklist

- Run `npm run typecheck`.
- Run `npm run lint`.
- Check parent and teacher flows on a narrow mobile viewport.
- Verify RTL layout, scrolling, bottom navigation and touch targets.
- Verify parent cannot access another child's data after Supabase Auth is connected.
- Verify contract upload failure and missing-file states before pilot.

## Known Risk

`npm audit` currently reports moderate vulnerabilities. Do not run `npm audit fix --force` casually because it may force a breaking Expo upgrade. Handle this in a planned dependency upgrade before production release.
