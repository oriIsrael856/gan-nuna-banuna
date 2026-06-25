import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { GalleryPhoto } from "../services/gallery.service";
import { Colors } from "../theme/colors";
import { BorderRadius, Spacing } from "../theme/spacing";

interface GalleryMediaViewerProps {
  photo: GalleryPhoto | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export function GalleryMediaViewer({
  photo,
  visible,
  onClose,
  onDelete,
}: GalleryMediaViewerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible && photo !== null}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {photo ? (
        <View style={styles.backdrop}>
          <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.iconButton}
              hitSlop={12}
              accessibilityLabel="סגירה"
            >
              <Ionicons name="close" size={28} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.label} numberOfLines={2}>
              {photo.label}
            </Text>
            {onDelete ? (
              <TouchableOpacity
                onPress={onDelete}
                style={styles.iconButton}
                hitSlop={12}
                accessibilityLabel="מחיקה"
              >
                <Ionicons name="trash-outline" size={24} color={Colors.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButton} />
            )}
          </View>

          <View style={styles.mediaWrap}>
            {photo.mediaType === "video" ? (
              <Video
                source={{ uri: photo.imageUrl }}
                style={styles.media}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay
              />
            ) : (
              <Image
                source={{ uri: photo.imageUrl }}
                style={styles.media}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
            {onDelete ? (
              <TouchableOpacity
                onPress={onDelete}
                style={styles.deleteBar}
                activeOpacity={0.85}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.white} />
                <Text style={styles.deleteBarText}>מחק מהגלריה</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={onClose} style={styles.closeBar} activeOpacity={0.85}>
              <Text style={styles.closeBarText}>סגירה</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
  },
  mediaWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  closeBar: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  footer: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  deleteBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  deleteBarText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  closeBarText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
});
