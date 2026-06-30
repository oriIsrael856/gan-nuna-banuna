import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppCard } from "../../src/components/AppCard";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  ALBUM_THEMES,
  createGalleryAlbum,
  deleteGalleryAlbum,
  getGalleryAlbums,
  themeLabel,
} from "../../src/services/albums.service";
import { getGalleryPhotos } from "../../src/services/gallery.service";
import { confirmDelete } from "../../src/utils/confirm";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";

export default function TeacherAlbumsScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data: albums, loading, error, reload } = useAsyncData(() => getGalleryAlbums(), []);
  const { data: photos } = useAsyncData(() => getGalleryPhotos(), []);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState<string>(ALBUM_THEMES[0].id);
  const [description, setDescription] = useState("");
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const photoList = photos ?? [];

  function togglePhoto(photoId: string) {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId],
    );
  }

  async function handleCreate() {
    if (!title.trim()) {
      Alert.alert("חסר כותרת", "יש להזין שם לאלבום.");
      return;
    }
    if (!selectedPhotoIds.length) {
      Alert.alert("בחרו תמונות", "יש לבחור לפחות תמונה אחת לקולאז.");
      return;
    }

    setSaving(true);
    const ok = await createGalleryAlbum({
      title,
      theme,
      description,
      photoIds: selectedPhotoIds,
    });
    setSaving(false);

    if (ok) {
      setShowForm(false);
      setTitle("");
      setDescription("");
      setSelectedPhotoIds([]);
      reload();
      Alert.alert("נוצר", "האלבום נוסף לגלריה.");
    } else {
      Alert.alert("שגיאה", "לא הצלחנו ליצור את האלבום.");
    }
  }

  function handleDelete(albumId: string) {
    confirmDelete("למחוק את האלבום?", async () => {
      await deleteGalleryAlbum(albumId);
      reload();
    });
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader variant="back" onLeadingPress={() => router.back()} onBellPress={() => router.push("/notifications")} />
        <Text style={styles.title}>אלבומים וקולאזים</Text>
        <Text style={styles.subtitle}>ארגון תמונות לפי נושא · טיול, חג, יום הולדת</Text>

        {loading ? (
          <AppStateCard state="loading" title="טוען אלבומים" message="רגע..." />
        ) : error ? (
          <AppStateCard state="error" title="שגיאה" message="לא הצלחנו לטעון." actionLabel="נסו שוב" onActionPress={reload} />
        ) : (
          <>
            {(albums ?? []).map((album) => (
              <AppCard key={album.id} style={styles.albumCard}>
                <View style={styles.albumRow}>
                  {album.coverImageUrl ? (
                    <Image source={{ uri: album.coverImageUrl }} style={styles.cover} />
                  ) : (
                    <View style={[styles.cover, styles.coverPlaceholder]}>
                      <Ionicons name="images-outline" size={24} color={Colors.primary} />
                    </View>
                  )}
                  <View style={styles.albumInfo}>
                    <Text style={styles.albumTitle}>{album.title}</Text>
                    <Text style={styles.albumMeta}>{themeLabel(album.theme)} · {album.photoCount} תמונות</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(album.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`מחיקת אלבום ${album.title}`}
                    style={styles.iconButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </AppCard>
            ))}

            {!showForm ? (
              <AppButton title="יצירת אלבום / קולאז" onPress={() => setShowForm(true)} />
            ) : (
              <AppCard style={styles.formCard}>
                <Text style={styles.formTitle}>אלבום חדש</Text>
                <AppTextInput label="כותרת" value={title} onChangeText={setTitle} />
                <Text style={styles.fieldLabel}>נושא</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeRow}>
                  {ALBUM_THEMES.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.themeChip, theme === t.id && styles.themeChipActive]}
                      onPress={() => setTheme(t.id)}
                      accessibilityRole="radio"
                      accessibilityLabel={t.label}
                      accessibilityState={{ selected: theme === t.id }}
                    >
                      <Text style={[styles.themeChipText, theme === t.id && styles.themeChipTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <AppTextInput label="תיאור (אופציונלי)" value={description} onChangeText={setDescription} />
                <Text style={styles.fieldLabel}>בחרו תמונות לקולאז ({selectedPhotoIds.length})</Text>
                <View style={styles.photoGrid}>
                  {photoList.map((photo) => {
                    const selected = selectedPhotoIds.includes(photo.id);
                    return (
                      <TouchableOpacity
                        key={photo.id}
                        onPress={() => togglePhoto(photo.id)}
                        style={styles.photoTile}
                        accessibilityRole="checkbox"
                        accessibilityLabel="תמונה לקולאז'"
                        accessibilityState={{ checked: selected }}
                      >
                        <Image source={{ uri: photo.imageUrl }} style={styles.photoImage} />
                        {selected ? (
                          <View style={styles.selectedBadge}>
                            <Ionicons name="checkmark" size={14} color={Colors.white} />
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <AppButton title={saving ? "יוצר..." : "יצירה"} onPress={handleCreate} disabled={saving} />
                <AppButton title="ביטול" variant="secondary" onPress={() => setShowForm(false)} />
              </AppCard>
            )}
          </>
        )}
      </AppScreen>
      <BottomNavBar activeItem="home" variant="teacher" onItemPress={handleBottomNavPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBackground },
  screenContent: { paddingBottom: Spacing.xxl },
  title: { ...Typography.titleLarge, color: Colors.textPrimary, textAlign: "right", marginTop: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: "right", marginBottom: Spacing.lg },
  albumCard: { marginBottom: Spacing.sm },
  albumRow: { flexDirection: "row-reverse", alignItems: "center", gap: Spacing.md },
  cover: { width: 56, height: 56, borderRadius: BorderRadius.md },
  coverPlaceholder: { backgroundColor: Colors.secondary, alignItems: "center", justifyContent: "center" },
  albumInfo: { flex: 1, alignItems: "flex-end" },
  albumTitle: { ...Typography.subtitle, fontWeight: "700", color: Colors.textPrimary },
  albumMeta: { ...Typography.label, color: Colors.textSecondary, marginTop: 2 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  formCard: { gap: Spacing.sm, marginTop: Spacing.md },
  formTitle: { ...Typography.title, color: Colors.textPrimary, textAlign: "right" },
  fieldLabel: { ...Typography.bodyMedium, fontWeight: "700", color: Colors.textPrimary, textAlign: "right" },
  themeRow: { flexDirection: "row-reverse", gap: Spacing.sm, paddingVertical: Spacing.xs },
  themeChip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
  },
  themeChipActive: { backgroundColor: Colors.primary },
  themeChipText: { ...Typography.captionMedium, color: Colors.textPrimary },
  themeChipTextActive: { color: Colors.white, fontWeight: "700" },
  photoGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: Spacing.sm },
  photoTile: { width: "30%", aspectRatio: 1, borderRadius: BorderRadius.sm, overflow: "hidden" },
  photoImage: { width: "100%", height: "100%" },
  selectedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
