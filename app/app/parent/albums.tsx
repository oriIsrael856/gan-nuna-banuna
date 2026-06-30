import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import { getGalleryAlbums, themeLabel } from "../../src/services/albums.service";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

export default function ParentAlbumsScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("parent");
  const { data, loading, error, reload } = useAsyncData(() => getGalleryAlbums(), []);

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          onLeadingPress={() => router.back()}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>אלבומים לפי נושא</Text>
        <Text style={styles.subtitle}>קולאזים ורגעים מיוחדים מהגן</Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען אלבומים" message="רגע..." />
        ) : error ? (
          <AppStateCard state="error" title="שגיאה" message="לא הצלחנו לטעון." actionLabel="נסו שוב" onActionPress={reload} />
        ) : (data ?? []).length === 0 ? (
          <AppStateCard state="empty" title="אין אלבומים עדיין" message="הגן ייצור אלבומים לפי נושאים — טיולים, חגים ועוד." />
        ) : (
          (data ?? []).map((album) => (
            <TouchableOpacity
              key={album.id}
              activeOpacity={0.85}
              onPress={() => router.push(`/parent/album/${album.id}` as Href)}
              accessibilityRole="button"
              accessibilityLabel={`אלבום ${album.title}`}
            >
              <View style={styles.albumCard}>
                {album.coverImageUrl ? (
                  <Image source={{ uri: album.coverImageUrl }} style={styles.cover} />
                ) : (
                  <View style={[styles.cover, styles.coverPlaceholder]}>
                    <Ionicons name="images-outline" size={28} color={Colors.primary} />
                  </View>
                )}
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle}>{album.title}</Text>
                  <Text style={styles.albumMeta}>
                    {themeLabel(album.theme)} · {album.photoCount} תמונות
                  </Text>
                </View>
                <Ionicons name="chevron-back" size={18} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
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
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: "right", marginBottom: Spacing.lg },
  albumCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cover: { width: 72, height: 72, borderRadius: BorderRadius.md },
  coverPlaceholder: { backgroundColor: Colors.secondary, alignItems: "center", justifyContent: "center" },
  albumInfo: { flex: 1, alignItems: "flex-end" },
  albumTitle: { ...Typography.subtitle, fontWeight: "700", color: Colors.textPrimary },
  albumMeta: { ...Typography.label, color: Colors.textSecondary, marginTop: 4 },
});
