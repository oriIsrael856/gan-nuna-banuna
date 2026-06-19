import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../src/components/AppButton";
import { AppHeader } from "../../src/components/AppHeader";
import { AppScreen } from "../../src/components/AppScreen";
import { AppStateCard } from "../../src/components/AppStateCard";
import { AppTextInput } from "../../src/components/AppTextInput";
import { BottomNavBar } from "../../src/components/BottomNavBar";
import { useAsyncData } from "../../src/hooks/useAsyncData";
import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";
import {
  deleteGalleryPhoto,
  getGalleryPhotos,
  uploadGalleryPhoto,
} from "../../src/services/gallery.service";
import { confirmDelete } from "../../src/utils/confirm";
import { Colors } from "../../src/theme/colors";
import { BorderRadius, Spacing } from "../../src/theme/spacing";

export default function TeacherGalleryScreen() {
  const router = useRouter();
  const handleBottomNavPress = useBottomNavPress("teacher");
  const { data, loading, error, reload } = useAsyncData(() => getGalleryPhotos(), []);
  const photos = data ?? [];
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("הרשאה נדרשת", "יש לאשר גישה לגלריית התמונות כדי להעלות תמונה.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setUploading(true);
    const ok = await uploadGalleryPhoto(
      asset.uri,
      label.trim() || asset.fileName || "תמונה מהגן",
      asset.mimeType ?? "image/jpeg",
    );
    setUploading(false);

    if (ok) {
      setLabel("");
      reload();
      Alert.alert("הועלה בהצלחה", "התמונה נוספה לגלריה.");
    } else {
      Alert.alert("שגיאה", "לא הצלחנו להעלות את התמונה. נסו שוב.");
    }
  }

  function handleDelete(photoId: string) {
    confirmDelete("למחוק את התמונה מהגלריה?", async () => {
      await deleteGalleryPhoto(photoId);
      reload();
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
        <Text style={styles.subtitle}>העלאת תמונות להורים</Text>

        <View style={styles.uploadBlock}>
          <AppTextInput
            value={label}
            onChangeText={setLabel}
            placeholder="תיאור לתמונה (אופציונלי)"
          />
          <AppButton
            title={uploading ? "מעלה..." : "העלאת תמונה"}
            onPress={handleUpload}
            disabled={uploading}
          />
        </View>

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
            message="העלו תמונה ראשונה מהגן."
          />
        ) : (
          <View style={styles.grid}>
            {photos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                activeOpacity={0.85}
                onLongPress={() => handleDelete(photo.id)}
                style={styles.tile}
              >
                <Image source={{ uri: photo.imageUrl }} style={styles.tileImage} />
                <Text style={styles.tileLabel} numberOfLines={1}>
                  {photo.label}
                </Text>
                <View style={styles.deleteHint}>
                  <Ionicons name="trash-outline" size={12} color={Colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </AppScreen>

      <BottomNavBar activeItem="home" variant="teacher" onItemPress={handleBottomNavPress} />
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
  uploadBlock: {
    gap: Spacing.sm,
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
    height: "72%",
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
