import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { GalleryCaptureButtons } from "../../src/components/GalleryCaptureButtons";
import { GalleryMediaViewer } from "../../src/components/GalleryMediaViewer";
import { GalleryPhotoTile } from "../../src/components/GalleryPhotoTile";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  deleteGalleryPhoto,
  getGalleryPhotos,
  type GalleryPhoto,
} from "../../src/services/gallery.service";
import { confirmDelete } from "../../src/utils/confirm";
import { Colors } from "../../src/theme/colors";
import { Spacing } from "../../src/theme/spacing";
import { Typography } from "../../src/theme/typography";



export default function TeacherGalleryScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const { data, loading, error, reload } = useAsyncData(() => getGalleryPhotos(), []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const photos = data ?? [];

  function handleDelete(photoId: string) {
    confirmDelete("למחוק מהגלריה?", async () => {
      const ok = await deleteGalleryPhoto(photoId);
      if (ok) {
        setSelectedPhoto(null);
        reload();
      } else {
        Alert.alert("שגיאה", "לא הצלחנו למחוק. נסו שוב.");
      }
    });
  }

  return (
    <View style={styles.root}>
      <AppScreen scrollable contentStyle={styles.screenContent}>
        <AppHeader
          variant="back"
          onLeadingPress={() => router.push("/teacher/home")}
          onBellPress={() => router.push("/notifications")}
        />
        <Text style={styles.title}>גלריית הגן</Text>
        <Text style={styles.subtitle}>צילום תמונות וסרטונים · שיתוף עם ההורים</Text>
        <TouchableOpacity
          onPress={() => router.push("/teacher/albums" as Href)}
          style={styles.albumLink}
          accessibilityRole="link"
          accessibilityLabel="אלבומים וקולאזים לפי נושא"
        >
          <Text style={styles.albumLinkText}>אלבומים וקולאזים לפי נושא ›</Text>
        </TouchableOpacity>

        <GalleryCaptureButtons onUploaded={reload} />

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
            title="אין מדיה עדיין"
            message="צלמו תמונה או סרטון מהמצלמה."
          />
        ) : (
          <View style={styles.grid}>
            {photos.map((photo) => (
              <GalleryPhotoTile
                key={photo.id}
                photo={photo}
                onPress={() => setSelectedPhoto(photo)}
                onDelete={() => handleDelete(photo.id)}
              />
            ))}
          </View>
        )}
      </AppScreen>

      <GalleryMediaViewer
        photo={selectedPhoto}
        visible={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        onDelete={
          selectedPhoto
            ? () => handleDelete(selectedPhoto.id)
            : undefined
        }
      />

      <BottomNavBar activeItem="home" variant="teacher" onItemPress={handleBottomNavPress} />
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
    gap: Spacing.lg,
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
  },
  albumLink: { alignSelf: "flex-end", minHeight: 44, justifyContent: "center" },
  albumLinkText: { ...Typography.bodyMedium, fontWeight: "700", color: Colors.primary },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});


