import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getGalleryPhotos } from "../../src/services/gallery.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";

export default function ParentGalleryScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const { data, loading, error, reload } = useAsyncData(() => getGalleryPhotos(), []);
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
        <Text style={styles.title}>גלריית תמונות</Text>
        <Text style={styles.subtitle}>רגעים מהיום בגן</Text>

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
              <View key={photo.id} style={styles.tile}>
                <Image source={{ uri: photo.imageUrl }} style={styles.tileImage} />
                <Text style={styles.tileLabel} numberOfLines={1}>
                  {photo.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </AppScreen>

      <BottomNavBar activeItem="home" variant="parent" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContent: {
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tile: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.secondary,
  },
  tileImage: {
    width: "100%",
    height: "78%",
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
});
