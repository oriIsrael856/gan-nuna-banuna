import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

import { isSupabaseConfigured, supabase } from "../lib/supabase";

const CONTRACTS_BUCKET = "contracts";
const SIGNED_URL_TTL_SECONDS = 60 * 10;

function sanitizeFileName(name: string): string {
  const trimmed = name.trim().toLowerCase();
  const normalized = trimmed.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
  const cleaned = normalized.replace(/^-+|-+$/g, "");
  return cleaned || "contract.pdf";
}

/**
 * Uploads a local file (file:// uri) to the private contracts bucket and
 * returns the stored object path, or null on failure / when not configured.
 */
export async function uploadContractFile(
  daycareId: string,
  childId: string,
  fileUri: string,
  fileName: string,
  mimeType = "application/pdf",
): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const fileBody = decode(base64);

    const path = `${daycareId}/${childId}/${Date.now()}-${sanitizeFileName(fileName)}`;

    const { error } = await supabase.storage
      .from(CONTRACTS_BUCKET)
      .upload(path, fileBody, { contentType: mimeType, upsert: false });

    if (error) {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

/**
 * Returns a short-lived signed URL for a stored contract file, or null.
 */
export async function getContractSignedUrl(
  filePath: string | undefined | null,
): Promise<string | null> {
  if (!filePath || !isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(CONTRACTS_BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return null;
  }

  return data.signedUrl;
}
