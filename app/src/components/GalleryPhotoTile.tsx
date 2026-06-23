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
  showDeleteHint?: boolean;
}

export function GalleryPhotoTile({
  photo,
  onPress,
  showDeleteHint = false,
}: GalleryPhotoTileProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.tile}>
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
      <Text style={styles.tileLabel} numberOfLines={1}>
        {photo.label}
      </Text>
      {showDeleteHint ? (
        <View style={styles.deleteHint}>
          <Ionicons name="trash-outline" size={12} color={Colors.textSecondary} />
        </View>
      ) : null}
    </TouchableOpacity>
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
  mediaWrap: {
    width: "100%",
    height: "72%",
    position: "relative",
  },
  tileImage: {
    width: "100%",
    height: "72%",
  },
  videoBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  deleteHint: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.full,
    padding: 2,
  },
});
