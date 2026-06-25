import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

import { CLIENT_CONFIG } from "../config/client.config";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { HeroKey } from "../types/daycareBranding";
import type { Database } from "../types/database";
import { getCurrentDaycareId } from "./auth.service";

const BRANDING_BUCKET = "daycare-branding";

export type DaycareSettings = {
  daycareId: string;
  daycareName: string;
  ownerName: string | null;
  tagline: string | null;
  subtitle: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
  cardBackgroundColor: string | null;
  textPrimaryColor: string | null;
  textSecondaryColor: string | null;
  supportPhone: string | null;
  supportEmail: string | null;
  logoUrl: string | null;
  setupCompleted: boolean;
};

export type DaycareSettingsInput = Partial<
  Omit<DaycareSettings, "daycareId" | "daycareName" | "setupCompleted">
> & {
  daycareName?: string;
};

type SettingsRow = Database["public"]["Tables"]["daycare_settings"]["Row"];
type DaycareRow = Database["public"]["Tables"]["daycares"]["Row"];

function mapSettings(daycare: DaycareRow, settings: SettingsRow | null): DaycareSettings {
  return {
    daycareId: daycare.id,
    daycareName: daycare.name,
    ownerName: settings?.owner_name ?? CLIENT_CONFIG.ownerName,
    tagline: settings?.tagline ?? CLIENT_CONFIG.homeTagline,
    subtitle: settings?.subtitle ?? CLIENT_CONFIG.homeSubtitle,
    primaryColor: settings?.primary_color ?? CLIENT_CONFIG.primaryColor,
    secondaryColor: settings?.secondary_color ?? CLIENT_CONFIG.secondaryColor,
    backgroundColor: settings?.background_color ?? CLIENT_CONFIG.backgroundColor,
    cardBackgroundColor: settings?.card_background_color ?? CLIENT_CONFIG.cardBackgroundColor,
    textPrimaryColor: settings?.text_primary_color ?? CLIENT_CONFIG.textPrimary,
    textSecondaryColor: settings?.text_secondary_color ?? CLIENT_CONFIG.textSecondary,
    supportPhone: settings?.support_phone ?? CLIENT_CONFIG.supportPhone,
    supportEmail: settings?.support_email ?? CLIENT_CONFIG.supportEmail,
    logoUrl: settings?.logo_url ?? null,
    setupCompleted: settings?.setup_completed ?? true,
  };
}

export function getDefaultDaycareSettings(): DaycareSettings {
  return {
    daycareId: "",
    daycareName: CLIENT_CONFIG.daycareName,
    ownerName: CLIENT_CONFIG.ownerName,
    tagline: CLIENT_CONFIG.homeTagline,
    subtitle: CLIENT_CONFIG.homeSubtitle,
    primaryColor: CLIENT_CONFIG.primaryColor,
    secondaryColor: CLIENT_CONFIG.secondaryColor,
    backgroundColor: CLIENT_CONFIG.backgroundColor,
    cardBackgroundColor: CLIENT_CONFIG.cardBackgroundColor,
    textPrimaryColor: CLIENT_CONFIG.textPrimary,
    textSecondaryColor: CLIENT_CONFIG.textSecondary,
    supportPhone: CLIENT_CONFIG.supportPhone,
    supportEmail: CLIENT_CONFIG.supportEmail,
    logoUrl: null,
    setupCompleted: true,
  };
}

export async function getDaycareSettings(daycareId?: string | null): Promise<DaycareSettings> {
  const id = daycareId ?? getCurrentDaycareId();
  if (!isSupabaseConfigured || !supabase || !id) {
    return getDefaultDaycareSettings();
  }

  const sb = supabase;
  const [daycareResult, settingsResult] = await Promise.all([
    sb.from("daycares").select("*").eq("id", id).maybeSingle(),
    sb.from("daycare_settings").select("*").eq("daycare_id", id).maybeSingle(),
  ]);

  if (!daycareResult.data) {
    return getDefaultDaycareSettings();
  }

  return mapSettings(daycareResult.data, settingsResult.data);
}

export async function isSetupCompleted(daycareId?: string | null): Promise<boolean> {
  const settings = await getDaycareSettings(daycareId);
  if (!settings.daycareId) {
    return true;
  }
  return settings.setupCompleted;
}

export async function updateDaycareSettings(input: DaycareSettingsInput): Promise<boolean> {
  const daycareId = getCurrentDaycareId();
  if (!isSupabaseConfigured || !supabase || !daycareId) {
    return true;
  }

  const sb = supabase;

  if (input.daycareName?.trim()) {
    const { error: daycareError } = await sb
      .from("daycares")
      .update({ name: input.daycareName.trim() })
      .eq("id", daycareId);
    if (daycareError) {
      return false;
    }
  }

  const patch: Database["public"]["Tables"]["daycare_settings"]["Update"] & {
    daycare_id: string;
  } = {
    daycare_id: daycareId,
    updated_at: new Date().toISOString(),
  };

  if (input.ownerName !== undefined) patch.owner_name = input.ownerName;
  if (input.tagline !== undefined) patch.tagline = input.tagline;
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle;
  if (input.primaryColor !== undefined) patch.primary_color = input.primaryColor;
  if (input.secondaryColor !== undefined) patch.secondary_color = input.secondaryColor;
  if (input.backgroundColor !== undefined) patch.background_color = input.backgroundColor;
  if (input.cardBackgroundColor !== undefined) patch.card_background_color = input.cardBackgroundColor;
  if (input.textPrimaryColor !== undefined) patch.text_primary_color = input.textPrimaryColor;
  if (input.textSecondaryColor !== undefined) patch.text_secondary_color = input.textSecondaryColor;
  if (input.supportPhone !== undefined) patch.support_phone = input.supportPhone;
  if (input.supportEmail !== undefined) patch.support_email = input.supportEmail;
  if (input.logoUrl !== undefined) patch.logo_url = input.logoUrl;

  const { error } = await sb.from("daycare_settings").upsert(patch, { onConflict: "daycare_id" });
  return !error;
}

export async function completeSetup(): Promise<boolean> {
  const daycareId = getCurrentDaycareId();
  if (!isSupabaseConfigured || !supabase || !daycareId) {
    return true;
  }

  const { error } = await supabase.from("daycare_settings").upsert(
    {
      daycare_id: daycareId,
      setup_completed: true,
      setup_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "daycare_id" },
  );

  return !error;
}

export async function getHeroImagePaths(daycareId?: string | null): Promise<Record<HeroKey, string>> {
  const id = daycareId ?? getCurrentDaycareId();
  const result = {} as Record<HeroKey, string>;

  if (!isSupabaseConfigured || !supabase || !id) {
    return result;
  }

  const { data } = await supabase.from("daycare_hero_images").select("*").eq("daycare_id", id);
  for (const row of data ?? []) {
    result[row.hero_key as HeroKey] = row.storage_path;
  }
  return result;
}

export async function getHeroPublicUrl(storagePath: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase || !storagePath) {
    return null;
  }

  const { data } = supabase.storage.from(BRANDING_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl ?? null;
}

export async function getHeroUrls(daycareId?: string | null): Promise<Partial<Record<HeroKey, string>>> {
  const paths = await getHeroImagePaths(daycareId);
  const urls: Partial<Record<HeroKey, string>> = {};

  await Promise.all(
    (Object.entries(paths) as [HeroKey, string][]).map(async ([key, path]) => {
      const url = await getHeroPublicUrl(path);
      if (url) {
        urls[key] = url;
      }
    }),
  );

  return urls;
}

function sanitizeHeroFileName(heroKey: string): string {
  return `${heroKey}.jpg`;
}

export async function uploadHeroImage(
  heroKey: HeroKey,
  fileUri: string,
  mimeType = "image/jpeg",
): Promise<boolean> {
  const daycareId = getCurrentDaycareId();
  if (!isSupabaseConfigured || !supabase || !daycareId) {
    return false;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const fileBody = decode(base64);
    const storagePath = `${daycareId}/heroes/${sanitizeHeroFileName(heroKey)}`;

    const { error: uploadError } = await supabase.storage
      .from(BRANDING_BUCKET)
      .upload(storagePath, fileBody, { contentType: mimeType, upsert: true });

    if (uploadError) {
      return false;
    }

    const { error: rowError } = await supabase.from("daycare_hero_images").upsert(
      {
        daycare_id: daycareId,
        hero_key: heroKey,
        storage_path: storagePath,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "daycare_id,hero_key" },
    );

    return !rowError;
  } catch {
    return false;
  }
}

export async function deleteHeroImage(heroKey: HeroKey): Promise<boolean> {
  const daycareId = getCurrentDaycareId();
  if (!isSupabaseConfigured || !supabase || !daycareId) {
    return true;
  }

  const { data: row } = await supabase
    .from("daycare_hero_images")
    .select("storage_path")
    .eq("daycare_id", daycareId)
    .eq("hero_key", heroKey)
    .maybeSingle();

  if (row?.storage_path) {
    await supabase.storage.from(BRANDING_BUCKET).remove([row.storage_path]);
  }

  const { error } = await supabase
    .from("daycare_hero_images")
    .delete()
    .eq("daycare_id", daycareId)
    .eq("hero_key", heroKey);

  return !error;
}
