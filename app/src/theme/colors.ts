import { CLIENT_CONFIG } from "../config/client.config";

export const Colors = {
  primary: CLIENT_CONFIG.primaryColor,
  secondary: CLIENT_CONFIG.secondaryColor,
  background: CLIENT_CONFIG.backgroundColor,
  cardBackground: CLIENT_CONFIG.cardBackgroundColor,
  pageBackground: "#FFF9F3", // warm cream page surface (matches Parent Home)
  textPrimary: CLIENT_CONFIG.textPrimary,
  textSecondary: CLIENT_CONFIG.textSecondary,
  warning: CLIENT_CONFIG.warningColor,
  error: CLIENT_CONFIG.errorColor,
  errorStrong: "#C0392B",
  white: "#FFFFFF",

  // Borders, dividers & neutral surfaces
  border: "#E8DDD2", // warm sand border (brand-aligned)
  borderNeutral: "#D8D8D8", // neutral gray (e.g. switch track off)
  divider: "#F0F0F0", // light divider / row separator
  surfaceMuted: "#EFE7DD", // warm muted background tint
  scrim: "rgba(0,0,0,0.25)", // dark overlay over media (video badge, etc.)
  heroOverlay: "rgba(0,0,0,0.3)", // dark gradient over hero banner photos, for title legibility
  modalOverlay: "rgba(0,0,0,0.4)", // backdrop behind modals/sheets
  reminderBorder: "rgba(192,120,32,0.2)", // warning-tinted border (reminder/attention cards)
  reminderIconBackground: "rgba(192,120,32,0.12)", // warning-tinted icon chip background

  // ── Warm home design system (Figma "Parent Home" language) ──
  // The refined palette introduced by the approved Parent Home redesign. Use
  // these across screens for the illustrated/warm look. See docs/16-design-system.md.
  brandGreen: "#315A44", // deep green — card titles, icons, active text
  brandGreenSoft: "#829D73", // softer green — raised home pill / active fills
  textMutedGreen: "#647166", // muted green-gray — dates, secondary labels on warm cards
  surfaceWarm: "#FFFCF8", // warm off-white — mini-card / tile surface
  surfaceNav: "#FFFDFC", // near-white — bottom nav / floating surfaces
  borderWarm: "#F1E6D7", // warm sand hairline border on warm tiles
  shadowGreen: "#1F3A2B", // green-tinted shadow color for warm cards/tiles
  badgeAlert: "#D96B5B", // notification badge / soft alert dot

  // Attendance status
  presentBackground: "#E8F5E4",
  presentText: "#4A8040",
  absentBackground: "#FDE8E8",
  absentText: "#C94040",
  lateBackground: "#FEF3E0",
  lateText: "#C07820",
  leftEarlyBackground: "#EDE8F5",
  leftEarlyText: "#6B4FA0",

  // Contract status
  sentBackground: "#FEF3E0",
  sentText: "#C07820",
  signedBackground: "#E8F5E4",
  signedText: "#4A8040",
  expiredBackground: "#FDE8E8",
  expiredText: "#C94040",
  draftBackground: "#F0F0F0",
  draftText: "#6B6B6B",
} as const;
