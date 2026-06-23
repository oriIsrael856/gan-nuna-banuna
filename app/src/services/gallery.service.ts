import { decode } from "base64-arraybuffer";
import { Platform } from "react-native";

import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getCurrentDaycareId, getCurrentUser } from "./auth.service";

export interface GalleryUploadResult {
  ok: boolean;
  error?: string;
}

const GALLERY_BUCKET = "gallery";

export type GalleryMediaType = "image" | "video";

export interface GalleryPhoto {
  id: string;
  label: string;
  imageUrl: string;
  mediaType: GalleryMediaType;
  createdAt: string;
}

function publicGalleryUrl(imagePath: string): string | null {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return null;
  }
  return `${baseUrl}/storage/v1/object/public/${GALLERY_BUCKET}/${imagePath}`;
}

function mediaTypeFromPath(path: string): GalleryMediaType {
  return /\.(mp4|mov|webm|m4v)$/i.test(path) ? "video" : "image";
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("png")) {
    return "png";
  }
  if (mimeType.includes("quicktime")) {
    return "mov";
  }
  if (mimeType.startsWith("video/")) {
    return "mp4";
  }
  return "jpg";
}

async function readUploadBody(uri: string, mimeType: string): Promise<ArrayBuffer | Blob> {
  const useFetch =
    Platform.OS === "web" ||
    !uri.startsWith("file://") ||
    mimeType.startsWith("video/");

  if (useFetch) {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to read media (${response.status})`);
    }
    const blob = await response.blob();
    return mimeType.startsWith("video/") ? blob : await blob.arrayBuffer();
  }

  const FileSystem = await import("expo-file-system/legacy");
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return decode(base64);
}

function profileIdForUpload(userId: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    ? userId
    : null;
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return [];
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("daycare_id", daycareId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => {
      const imageUrl = publicGalleryUrl(row.image_path);
      if (!imageUrl) {
        return null;
      }
      return {
        id: row.id,
        label: row.label ?? "תמונה",
        imageUrl,
        mediaType: mediaTypeFromPath(row.image_path),
        createdAt: row.created_at,
      };
    })
    .filter((row): row is GalleryPhoto => row !== null);
}

export async function uploadGalleryMedia(
  fileUri: string,
  label: string,
  mimeType = "image/jpeg",
): Promise<GalleryUploadResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: "Supabase לא מוגדר" };
  }

  const daycareId = getCurrentDaycareId();
  const userId = getCurrentUser().id;
  if (!daycareId) {
    return { ok: false, error: "לא נמצא גן מחובר לחשבון" };
  }

  try {
    const ext = extensionForMime(mimeType);
    const path = `${daycareId}/${Date.now()}.${ext}`;
    const body = await readUploadBody(fileUri, mimeType);

    const { error: uploadError } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(path, body, { contentType: mimeType, upsert: false });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const defaultLabel = mimeType.startsWith("video/") ? "סרטון" : "תמונה";
    const { error } = await supabase.from("gallery_photos").insert({
      daycare_id: daycareId,
      image_path: path,
      label: label.trim() || defaultLabel,
      uploaded_by: profileIdForUpload(userId),
    });

    if (error) {
      await supabase.storage.from(GALLERY_BUCKET).remove([path]);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "שגיאה לא ידועה";
    return { ok: false, error: message };
  }
}

/** @deprecated Use uploadGalleryMedia */
export async function uploadGalleryPhoto(
  fileUri: string,
  label: string,
  mimeType = "image/jpeg",
): Promise<boolean> {
  return (await uploadGalleryMedia(fileUri, label, mimeType)).ok;
}

export async function deleteGalleryPhoto(photoId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { data: row } = await supabase
    .from("gallery_photos")
    .select("image_path")
    .eq("id", photoId)
    .single();

  if (row?.image_path) {
    await supabase.storage.from(GALLERY_BUCKET).remove([row.image_path]);
  }

  const { error } = await supabase.from("gallery_photos").delete().eq("id", photoId);
  return !error;
}
