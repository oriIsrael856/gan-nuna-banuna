/**
 * Typography scale — use these instead of hardcoding fontSize/fontWeight.
 *
 * Hierarchy rule:
 *   display  → hero headings, splash screens
 *   title    → screen/section titles
 *   subtitle → card headers, section labels
 *   body     → regular content
 *   caption  → secondary text, dates, hints
 *   label    → form labels, badges
 */

export const Typography = {
  display: {
    fontSize: 28,
    fontWeight: "800" as const,
    lineHeight: 36,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: "700" as const,
    lineHeight: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: "500" as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
  },
  captionMedium: {
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
  },
  labelBold: {
    fontSize: 12,
    fontWeight: "700" as const,
    lineHeight: 16,
  },
} as const;
