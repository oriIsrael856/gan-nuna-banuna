import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

import type { GalleryPhoto } from "../services/gallery.service";
import { Colors } from "../theme/colors";
import { BorderRadius } from "../theme/spacing";

interface GalleryPhotoTileProps {
  photo: GalleryPhoto;
  onPress: () => void;
  onDelete?: () => void;
}

export function GalleryPhotoTile({
  photo,
  onPress,
  onDelete,
}: GalleryPhotoTileProps) {
  return (
    <View style={styles.tile}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.mediaButton}
        accessibilityRole="button"
        accessibilityLabel={
          photo.mediaType === "video" ? `סרטון: ${photo.label}` : `תמונה: ${photo.label}`
        }
      >
        {photo.mediaType === "video" ? (
          <View style={styles.mediaWrap}>
            <Video
              source={{ uri: photo.imageUrl }}
              style={styles.tileImage}
              resizeMode={ResizeMode.COVER}
              useNativeControls={false}
              shouldPlay={false}
            />
            <View style={styles.videoBadge}>
              <Ionicons name="play-circle" size={28} color={Colors.white} />
            </View>
          </View>
        ) : (
          <Image source={{ uri: photo.imageUrl }} style={styles.tileImage} />
        )}
      </TouchableOpacity>
      <Text style={styles.tileLabel} numberOfLines={1}>
        {photo.label}
      </Text>
      {onDelete ? (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="מחיקה"
        >
          <Ionicons name="trash-outline" size={14} color={Colors.error} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.secondary,
  },
  mediaButton: {
    width: "100%",
    height: "72%",
  },
  mediaWrap: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  videoBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.scrim,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  deleteButton: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
});
