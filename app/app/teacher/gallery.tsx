import React, { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import type { Href } from "expo-router";

import { Video, ResizeMode } from "expo-av";

import { Ionicons } from "@expo/vector-icons";



import { AppHeader } from "../../src/components/AppHeader";

import { AppScreen } from "../../src/components/AppScreen";

import { AppStateCard } from "../../src/components/AppStateCard";

import { BottomNavBar } from "../../src/components/BottomNavBar";

import { GalleryCaptureButtons } from "../../src/components/GalleryCaptureButtons";

import { useAsyncData } from "../../src/hooks/useAsyncData";

import { useBottomNavPress } from "../../src/navigation/useBottomNavPress";

import {

  deleteGalleryPhoto,

  getGalleryPhotos,

} from "../../src/services/gallery.service";

import { confirmDelete } from "../../src/utils/confirm";

import { Colors } from "../../src/theme/colors";

import { BorderRadius, Spacing } from "../../src/theme/spacing";



export default function TeacherGalleryScreen() {

  const router = useRouter();

  const handleBottomNavPress = useBottomNavPress("teacher");

  const { data, loading, error, reload } = useAsyncData(() => getGalleryPhotos(), []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const photos = data ?? [];



  function handleDelete(photoId: string) {

    confirmDelete("למחוק מהגלריה?", async () => {

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

        <Text style={styles.subtitle}>צילום תמונות וסרטונים · שיתוף עם ההורים</Text>

        <TouchableOpacity onPress={() => router.push("/teacher/albums" as Href)} style={styles.albumLink}>

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

              <TouchableOpacity

                key={photo.id}

                activeOpacity={0.85}

                onLongPress={() => handleDelete(photo.id)}

                style={styles.tile}

              >

                {photo.mediaType === "video" ? (

                  <View style={styles.videoTile}>

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

    gap: Spacing.lg,

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

  },

  albumLink: { alignSelf: "flex-end" },

  albumLinkText: { fontSize: 14, fontWeight: "700", color: Colors.primary },

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

  videoTile: {

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


