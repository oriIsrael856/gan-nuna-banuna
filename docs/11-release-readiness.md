# Release Readiness

## Store submission — deferred

**Do not submit to App Store / Google Play until:**

1. All items in `docs/13-pilot-qa-checklist.md` pass on real devices.
2. The team explicitly approves "production-perfect" for the pilot.

Until then, use `preview` or `development` EAS builds for internal testing only.

## Build Profiles

EAS profiles are defined in `app/eas.json`:

- `development` for development-client builds.
- `preview` for internal Android APK distribution.
- `production` for store-ready builds with auto-incremented versions.

## Before Every Client Build

Run from `app`:

```bash
npm run typecheck
npm run lint
```

Then test using the checklist in `docs/13-pilot-qa-checklist.md`:

## Before Store Submit (later phase)

When ready for stores:

- Final app icon and adaptive icon
- Final splash asset
- App Store / Play screenshots
- Privacy Policy + Terms URLs (live)
- EAS Secrets for production
- `eas build --profile production` + `eas submit`

## Commands

```bash
npx eas build --profile preview --platform android
npx eas build --profile production --platform android
npx eas build --profile production --platform ios
```
