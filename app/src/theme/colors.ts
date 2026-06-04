import { CLIENT_CONFIG } from "../config/client.config";

export const Colors = {
  primary: CLIENT_CONFIG.primaryColor,
  secondary: CLIENT_CONFIG.secondaryColor,
  background: CLIENT_CONFIG.backgroundColor,
  cardBackground: CLIENT_CONFIG.cardBackgroundColor,
  textPrimary: CLIENT_CONFIG.textPrimary,
  textSecondary: CLIENT_CONFIG.textSecondary,
  warning: CLIENT_CONFIG.warningColor,
  error: CLIENT_CONFIG.errorColor,
  white: "#FFFFFF",

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
