import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppHeader } from "../../../src/components/AppHeader";
import { AppScreen } from "../../../src/components/AppScreen";
import { AppStateCard } from "../../../src/components/AppStateCard";
import { BottomNavBar } from "../../../src/components/BottomNavBar";
import { useAsyncData } from "../../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../../src/navigation/useBottomNavPress";
import {
  getGalleryAlbumDetail,
  themeLabel,
  type GalleryAlbumPhoto,
} from "../../../src/services/albums.service";
import { Colors } from "../../../src/theme/colors";
import { BorderRadius, Spacing } from "../../../src/theme/spacing";
import { Typography } from "../../../src/theme/typography";

export default function ParentAlbumDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const handleBottomNavPress = useBottomNavPress("parent");

  const { data: album, loading, error, reload } = useAsyncData(
    () => (id ? getGalleryAlbumDetail(id) : Promise.resolve(null)),
    [id],
  );

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          onLeadingPress={() => router.back()}
          onBellPress={() => router.push("/notifications")}
        />

        {loading ? (
          <AppStateCard state="loading" title="טוען אלבום" message="רגע..." />
        ) : error || !album ? (
          <AppStateCard state="error" title="לא נמצא" message="האלבום לא זמין." actionLabel="חזרה" onActionPress={() => router.back()} />
        ) : (
          <>
            <Text style={styles.title}>{album.title}</Text>
            <Text style={styles.subtitle}>
              {themeLabel(album.theme)} · {album.photoCount} תמונות
            </Text>
            {album.description ? <Text style={styles.description}>{album.description}</Text> : null}

            <View style={styles.collageGrid}>
              {album.photos.map((photo: GalleryAlbumPhoto, index: number) => (
                <View
                  key={photo.id}
                  style={[
                    styles.collageTile,
                    index === 0 && album.photos.length > 1 ? styles.collageHero : undefined,
                  ]}
                >
                  <Image source={{ uri: photo.imageUrl }} style={styles.collageImage} />
                  <Text style={styles.photoLabel} numberOfLines={1}>
                    {photo.label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </AppScreen>
      <BottomNavBar activeItem="home" variant="parent" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBackground },
  screenContent: { paddingBottom: Spacing.xxl },
  title: { ...Typography.titleLarge, color: Colors.textPrimary, textAlign: "right", marginTop: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: "right", marginBottom: Spacing.sm },
  description: { ...Typography.body, color: Colors.textPrimary, textAlign: "right", marginBottom: Spacing.md },
  collageGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: Spacing.sm },
  collageTile: { width: "48%", borderRadius: BorderRadius.md, overflow: "hidden", backgroundColor: Colors.cardBackground },
  collageHero: { width: "100%", aspectRatio: 16 / 10 },
  collageImage: { width: "100%", aspectRatio: 1 },
  photoLabel: { ...Typography.label, color: Colors.textSecondary, textAlign: "right", padding: Spacing.xs },
});
