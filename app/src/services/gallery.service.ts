import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getCurrentDaycareId, getCurrentUser } from "./auth.service";

const GALLERY_BUCKET = "gallery";

export interface GalleryPhoto {
  id: string;
  label: string;
  imageUrl: string;
  createdAt: string;
}

function publicGalleryUrl(imagePath: string): string | null {
  const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return null;
  }
  return `${baseUrl}/storage/v1/object/public/${GALLERY_BUCKET}/${imagePath}`;
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
        createdAt: row.created_at,
      };
    })
    .filter((row): row is GalleryPhoto => row !== null);
}

export async function uploadGalleryPhoto(
  fileUri: string,
  label: string,
  mimeType = "image/jpeg",
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  const daycareId = getCurrentDaycareId();
  const userId = getCurrentUser().id;
  if (!daycareId) {
    return false;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const path = `${daycareId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(path, decode(base64), { contentType: mimeType, upsert: false });

    if (uploadError) {
      return false;
    }

    const { error } = await supabase.from("gallery_photos").insert({
      daycare_id: daycareId,
      image_path: path,
      label: label.trim() || "תמונה",
      uploaded_by: userId,
    });

    return !error;
  } catch {
    return false;
  }
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
