import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "./AppButton";
import { AppTextInput } from "./AppTextInput";
import { uploadGalleryMedia } from "../services/gallery.service";
import { pickGalleryMedia, type GalleryCaptureMode } from "../utils/galleryMediaPicker";
import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";

interface GalleryCaptureButtonsProps {
  defaultLabel?: string;
  onUploaded?: () => void;
  compact?: boolean;
  /** When true, show inline success instead of alert — better for multiple uploads in a row */
  quietSuccess?: boolean;
}

export function GalleryCaptureButtons({
  defaultLabel = "",
  onUploaded,
  compact = false,
  quietSuccess = false,
}: GalleryCaptureButtonsProps) {
  const [label, setLabel] = useState(defaultLabel);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleCapture(mode: GalleryCaptureMode) {
    const media = await pickGalleryMedia(mode);
    if (!media) {
      return;
    }

    const fallbackLabel =
      media.mediaType === "video"
        ? "סרטון מהגן"
        : mode === "camera-photo"
          ? "תמונה מהמצלמה"
          : "תמונה מהגן";

    setUploading(true);
    const result = await uploadGalleryMedia(
      media.uri,
      label.trim() || media.fileName || fallbackLabel,
      media.mimeType,
    );
    setUploading(false);

    if (result.ok) {
      setLabel(defaultLabel);
      onUploaded?.();
      const message =
        media.mediaType === "video" ? "הסרטון נוסף לגלריה" : "התמונה נוספה לגלריה";
      if (quietSuccess) {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        Alert.alert("הועלה בהצלחה", `${message}.`);
      }
    } else {
      Alert.alert("שגיאה", result.error ?? "לא הצלחנו להעלות את הקובץ. נסו שוב.");
    }
  }

  if (compact) {
    return (
      <View style={styles.compactBlock}>
        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}
        <View style={styles.compactRow}>
        <CaptureChip
          icon="camera-outline"
          label="צילום"
          disabled={uploading}
          onPress={() => handleCapture("camera-photo")}
        />
        <CaptureChip
          icon="videocam-outline"
          label="סרטון"
          disabled={uploading}
          onPress={() => handleCapture("camera-video")}
        />
        <CaptureChip
          icon="images-outline"
          label="גלריה"
          disabled={uploading}
          onPress={() => handleCapture("library")}
        />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.block}>
      {successMessage ? (
        <Text style={styles.successText}>{successMessage}</Text>
      ) : null}
      <AppTextInput
        value={label}
        onChangeText={setLabel}
        placeholder="תיאור (אופציונלי)"
      />
      <View style={styles.buttonRow}>
        <AppButton
          title={uploading ? "מעלה..." : "צילום תמונה"}
          onPress={() => handleCapture("camera-photo")}
          disabled={uploading}
          style={styles.flexBtn}
        />
        <AppButton
          title={uploading ? "מעלה..." : "צילום סרטון"}
          variant="secondary"
          onPress={() => handleCapture("camera-video")}
          disabled={uploading}
          style={styles.flexBtn}
        />
      </View>
      <AppButton
        title="בחירה מהגלריה"
        variant="secondary"
        onPress={() => handleCapture("library")}
        disabled={uploading}
      />
    </View>
  );
}

function CaptureChip({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, disabled && styles.chipDisabled]}
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.chipLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.sm,
  },
  buttonRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
  compactRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  compactBlock: {
    gap: Spacing.xs,
  },
  successText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.presentText,
    textAlign: "right",
  },
});
