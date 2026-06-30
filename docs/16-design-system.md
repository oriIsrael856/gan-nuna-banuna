# 16 — Warm Home Design System

The visual language approved on the **Parent Home** redesign, generalized so it
can be applied consistently across every screen. This doc is the contract
between the two parallel tracks:

- **Track A (assets & design system):** owns `assets/**`, `src/components/**`
  shared kit, `src/theme/**`, and the optimization script.
- **Track B (screen application):** owns `app/app/**` — applies this system to
  each screen using the tokens and components below.

**Golden rules**
1. Never hardcode a hex color, shadow, or radius in a screen — use the tokens.
2. Reuse the shared components below instead of re-implementing the card/grid.
3. Every touchable gets `accessibilityRole` + a Hebrew `accessibilityLabel`.
4. Every dynamic section gets empty / loading / error states (`AppStateCard`).
5. Track B never edits `assets/`, `src/theme/`, or the shared kit. Track A never
   edits screens.

---

## Tokens

### Colors — `src/theme/colors.ts`
The warm design language lives under the "Warm home design system" group:

| Token | Value | Use |
|---|---|---|
| `Colors.brandGreen` | `#315A44` | card titles, icons, active text |
| `Colors.brandGreenSoft` | `#829D73` | raised home pill / active fills |
| `Colors.textMutedGreen` | `#647166` | dates, secondary labels on warm cards |
| `Colors.surfaceWarm` | `#FFFCF8` | warm mini-card / tile surface |
| `Colors.surfaceNav` | `#FFFDFC` | bottom nav / floating surfaces |
| `Colors.borderWarm` | `#F1E6D7` | hairline border on warm tiles |
| `Colors.shadowGreen` | `#1F3A2B` | green-tinted shadow color |
| `Colors.badgeAlert` | `#D96B5B` | notification badge / alert dot |

Existing tokens still apply: `Colors.background` (`#FFF8F1` cream), `Colors.white`,
`Colors.textPrimary/textSecondary`, status colors, etc.

### Shadows — `src/theme/spacing.ts` (`Shadow`)
- `Shadow.warmTile` — small green-tinted shadow for action tiles.
- `Shadow.warmCard` — slightly larger shadow for summary / hero cards.

### Radii — `src/theme/spacing.ts` (`BorderRadius`)
`sm:8 · md:12 · lg:16 · xl:24 · full:9999`. Design uses 10 (tiles), 12 (mini-cards),
16 (pill), 20 (cards) — compose from these (e.g. `BorderRadius.xl - 4` = 20).

---

## Components — `src/components/`

### `AppActionGrid`
The signature warm 3-column grid of action tiles.

```tsx
import { AppActionGrid, type AppActionItem } from "../../src/components/AppActionGrid";

const actions: AppActionItem[] = [
  {
    id: "daily",
    title: "סיכום יום",
    subtitle: "מעקב ותיעוד יומי",
    iconName: "dailySummary",            // placeholder until bespoke art exists
    // illustration: HomeAssets.quickActions.dailySummary,  // optimized PNG when ready
    onPress: () => router.push("/parent/daily-summary"),
  },
  // ...
];

<AppActionGrid actions={actions} />
```

- Pass `illustration` (an optimized PNG `ImageSourcePropType`) once bespoke art is
  available; otherwise pass `iconName` (an `IllustratedIconName`) to render the
  IllustratedIcon placeholder — so a screen can adopt the layout now and get art later.
- Order items in **RTL visual order** (first item renders on the right).

### `AppSummaryCard`
The warm "today summary" card with a row of mini-tiles.

```tsx
import { AppSummaryCard, type AppSummaryItem } from "../../src/components/AppSummaryCard";

const items: AppSummaryItem[] = [
  { key: "events", label: "אירועים קרובים", value: "2", iconName: "events" },
  { key: "messages", label: "הודעות חדשות", value: String(unread), iconName: "messages" },
  // ...
];

<AppSummaryCard items={items} />          // title defaults to "סיכום היום", date = today
```

### `IllustratedIcon` — `src/components/IllustratedIcon.tsx`
Renders a registered illustrated icon, or a branded placeholder tile (colored
square + line icon) while real art is pending. Registry: `src/theme/illustratedIcons.ts`.

---

## Assets & optimization (Track A only)

Raw Figma exports are multi-MB at 1024–1536px but render at <130px. They **must**
be optimized before use.

1. Track B drops raw exports in `assets/_inbox/` and flags them (never references
   them from code).
2. Track A resizes to retina display size (≈ display × 3) + compresses, then moves
   them to a final folder and registers them.
3. Pattern/script: `scripts/optimize-parent-home-assets.mjs`
   (`npm install --no-save sharp && node scripts/...`). Parent Home went from
   **23 MB → 615 KB (−97%)** this way.

Same filenames in/out keep code stable. High-res originals stay in git history.

---

## Coordination

- Each track works on its own branch; Track A's `src/` + `assets/` merges first,
  then Track B rebases.
- Need a new component variant or a missing asset? Track B requests it from
  Track A rather than editing the shared kit or `assets/`.
