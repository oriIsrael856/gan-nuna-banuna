import type React from "react";
import type { ImageSource } from "expo-image";
import type { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/**
 * Registry of warm illustrated ("watercolor") icons used across the app.
 *
 * Each name maps to its (optimized) image asset, reusing the approved Parent
 * Home illustrations wherever the same concept appears on another screen — so a
 * "calendar"/"messages"/"daily summary" card looks identical everywhere via a
 * single source of truth. Concepts without dedicated art stay `null` and render
 * a branded placeholder (colored tile + fallback Ionicon). To add art later,
 * point the entry at the optimized PNG.
 */
export const IllustratedIcons: Record<string, ImageSource | null> = {
  calendar: require("../../assets/parent/home/quick-actions/action-calendar.png") as ImageSource,
  documents: require("../../assets/parent/home/quick-actions/action-forms-and-documents.png") as ImageSource,
  dailySummary: require("../../assets/parent/home/quick-actions/action-daily-summary.png") as ImageSource,
  albums: require("../../assets/parent/home/quick-actions/action-albums.png") as ImageSource,
  cameras: require("../../assets/parent/home/quick-actions/action-live-cameras.png") as ImageSource,
  photos: require("../../assets/parent/home/quick-actions/action-today-photos.png") as ImageSource,
  contact: require("../../assets/parent/home/quick-actions/action-contact-kindergarten.png") as ImageSource,
  suggestions: require("../../assets/parent/home/quick-actions/action-kindergarten-suggestions.png") as ImageSource,
  messages: require("../../assets/parent/home/quick-actions/action-kindergarten-announcements.png") as ImageSource,
  attendance: require("../../assets/parent/home/summary/summary-monthly-attendance.png") as ImageSource,
  events: require("../../assets/parent/home/summary/summary-upcoming-events.png") as ImageSource,
  children: require("../../assets/parent/home/summary/summary-my-children-in-kindergarten.png") as ImageSource,
  // Concepts without dedicated art yet — render the placeholder tile.
  contracts: require("../../assets/parent/home/quick-actions/action-forms-and-documents.png") as ImageSource,
  uploadContract: null,
  absence: null,
  profile: null,
};

export type IllustratedIconName = keyof typeof IllustratedIcons;

/** Line-icon shown inside the placeholder tile until real artwork is supplied. */
export const IllustratedIconFallback: Record<IllustratedIconName, IoniconName> = {
  calendar: "calendar-outline",
  documents: "document-text-outline",
  dailySummary: "sparkles-outline",
  albums: "albums-outline",
  cameras: "videocam-outline",
  photos: "images-outline",
  contact: "call-outline",
  suggestions: "bulb-outline",
  messages: "megaphone-outline",
  attendance: "people-outline",
  events: "calendar-number-outline",
  children: "happy-outline",
  profile: "person-outline",
  contracts: "folder-open-outline",
  uploadContract: "cloud-upload-outline",
  absence: "alert-circle-outline",
};
