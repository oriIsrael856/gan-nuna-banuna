import { isSupabaseConfigured, supabase } from "../lib/supabase";

const ACTIVITY_IMAGES_BUCKET = "activity-images";

export interface CatalogActivity {
  id: string;
  title: string;
  category: string | null;
  imagePath: string | null;
  imageUrl: string | null;
}

/**
 * Builds a public URL for an activity image stored in the public
 * `activity-images` bucket. Returns null when no path or no client.
 */
export function catalogImageUrl(path: string | null | undefined): string | null {
  if (!path || !supabase) {
    return null;
  }
  const { data } = supabase.storage.from(ACTIVITY_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl ?? null;
}

export async function getActivityCatalog(): Promise<CatalogActivity[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("activity_catalog")
    .select("*")
    .order("sort_order");

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    imagePath: row.image_path,
    imageUrl: catalogImageUrl(row.image_path),
  }));
}
