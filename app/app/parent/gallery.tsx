import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { GalleryMediaViewer } from "../../src/components/GalleryMediaViewer";
import { GalleryPhotoTile } from "../../src/components/GalleryPhotoTile";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getGalleryPhotos, type GalleryPhoto } from "../../src/services/gallery.service";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

export default function ParentGalleryScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const { data, loading, error, reload } = useAsyncData(() => getGalleryPhotos(), []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const photos = data ?? [];

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/parent/home");
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          notificationCount={0}
          onLeadingPress={handleBack}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>גלריית הגן</Text>
        <Text style={styles.subtitle}>תמונות וסרטונים מהיום בגן</Text>
        <TouchableOpacity
          onPress={() => router.push("/parent/albums" as Href)}
          style={styles.albumLink}
          accessibilityRole="button"
          accessibilityLabel="מעבר לאלבומים לפי נושא"
        >
          <Text style={styles.albumLinkText}>אלבומים לפי נושא ›</Text>
        </TouchableOpacity>

        {loading ? (
          <AppStateCard state="loading" title="טוען תמונות" message="רגע..." />
        ) : error ? (
          <AppStateCard
            state="error"
            title="לא הצלחנו לטעון"
            message="אירעה שגיאה בטעינת הגלריה."
            actionLabel="נסו שוב"
            onActionPress={reload}
          />
        ) : photos.length === 0 ? (
          <AppStateCard
            state="empty"
            title="אין תמונות עדיין"
            message="תמונות מהגן יופיעו כאן כשהצוות יעלה אותן."
          />
        ) : (
          <View style={styles.grid}>
            {photos.map((photo) => (
              <GalleryPhotoTile
                key={photo.id}
                photo={photo}
                onPress={() => setSelectedPhoto(photo)}
              />
            ))}
          </View>
        )}
      </AppScreen>

      <GalleryMediaViewer
        photo={selectedPhoto}
        visible={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
      />

      <BottomNavBar activeItem="home" variant="parent" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBackground,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  albumLink: {
    alignSelf: "flex-end",
    minHeight: 44,
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  albumLinkText: { ...Typography.captionMedium, fontWeight: "700", color: Colors.primary },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});

