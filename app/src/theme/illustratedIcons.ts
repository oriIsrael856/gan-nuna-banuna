import type React from "react";
import type { ImageSource } from "expo-image";
import type { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/**
 * Registry of warm illustrated ("watercolor") icons used across the app.
 *
 * Each entry maps a stable name to its image asset. While the real artwork is
 * being exported from Figma, leave the source as `null` — `IllustratedIcon`
 * will render a branded placeholder (colored tile + the fallback Ionicon) so
 * layout and navigation work today. To switch to the real art later, drop the
 * file into `assets/icons/` and change `null` to `require("../../assets/icons/<file>")`.
 */
export const IllustratedIcons: Record<string, ImageSource | null> = {
  calendar: null,
  documents: null,
  dailySummary: null,
  albums: null,
  cameras: null,
  photos: null,
  contact: null,
  suggestions: null,
  messages: null,
  attendance: null,
  events: null,
  children: null,
  profile: null,
  contracts: null,
  uploadContract: null,
  absence: null,
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
