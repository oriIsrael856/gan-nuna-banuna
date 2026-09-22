import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getCurrentDaycareId, getCurrentUser } from "./auth.service";
import { todayIso } from "./mappers";

export type MealAmount = "all" | "most" | "some" | "none";
export type Mood = "happy" | "calm" | "tired" | "upset";

export const MEAL_AMOUNT_OPTIONS: { value: MealAmount; label: string }[] = [
  { value: "all", label: "אכל/ה הכל" },
  { value: "most", label: "רוב" },
  { value: "some", label: "קצת" },
  { value: "none", label: "לא אכל/ה" },
];

export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: "happy", label: "שמח/ה", emoji: "😊" },
  { value: "calm", label: "רגוע/ה", emoji: "😌" },
  { value: "tired", label: "עייף/ה", emoji: "🥱" },
  { value: "upset", label: "מתקשה", emoji: "😢" },
];

export function mealAmountLabel(value: string | null | undefined): string | null {
  return MEAL_AMOUNT_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function moodOption(value: string | null | undefined) {
  return MOOD_OPTIONS.find((option) => option.value === value) ?? null;
}

export interface ChildDailyUpdate {
  id: string;
  childId: string;
  date: string;
  mealBreakfast: MealAmount | null;
  mealLunch: MealAmount | null;
  mealSnack: MealAmount | null;
  napStart: string | null;
  napEnd: string | null;
  mood: Mood | null;
  diaperCount: number | null;
  note: string | null;
  updatedAt: string;
}

export interface ChildDailyUpdateInput {
  mealBreakfast: MealAmount | null;
  mealLunch: MealAmount | null;
  mealSnack: MealAmount | null;
  napStart: string | null;
  napEnd: string | null;
  mood: Mood | null;
  diaperCount: number | null;
  note: string | null;
}

type UpdateRow = {
  id: string;
  child_id: string;
  update_date: string;
  meal_breakfast: string | null;
  meal_lunch: string | null;
  meal_snack: string | null;
  nap_start: string | null;
  nap_end: string | null;
  mood: string | null;
  diaper_count: number | null;
  note: string | null;
  updated_at: string;
};

const SELECT_COLUMNS =
  "id, child_id, update_date, meal_breakfast, meal_lunch, meal_snack, nap_start, nap_end, mood, diaper_count, note, updated_at";

/** Postgres returns time as HH:MM:SS; the UI works with HH:MM. */
function shortTime(value: string | null): string | null {
  return value ? value.slice(0, 5) : null;
}

function mapUpdate(row: UpdateRow): ChildDailyUpdate {
  return {
    id: row.id,
    childId: row.child_id,
    date: row.update_date,
    mealBreakfast: (row.meal_breakfast as MealAmount | null) ?? null,
    mealLunch: (row.meal_lunch as MealAmount | null) ?? null,
    mealSnack: (row.meal_snack as MealAmount | null) ?? null,
    napStart: shortTime(row.nap_start),
    napEnd: shortTime(row.nap_end),
    mood: (row.mood as Mood | null) ?? null,
    diaperCount: row.diaper_count,
    note: row.note,
    updatedAt: row.updated_at,
  };
}

export function hasAnyContent(update: ChildDailyUpdate | null): boolean {
  if (!update) {
    return false;
  }
  return Boolean(
    update.mealBreakfast ||
      update.mealLunch ||
      update.mealSnack ||
      update.napStart ||
      update.napEnd ||
      update.mood ||
      update.diaperCount !== null ||
      update.note,
  );
}

export async function getChildDailyUpdate(
  childId: string,
  date: string = todayIso(),
): Promise<ChildDailyUpdate | null> {
  if (!isSupabaseConfigured || !supabase || !childId) {
    return null;
  }

  const { data } = await supabase
    .from("child_daily_updates")
    .select(SELECT_COLUMNS)
    .eq("child_id", childId)
    .eq("update_date", date)
    .maybeSingle();

  return data ? mapUpdate(data) : null;
}

/** Teacher overview: which children already have an update today. */
export async function getTodayUpdatedChildIds(): Promise<Set<string>> {
  if (!isSupabaseConfigured || !supabase) {
    return new Set();
  }

  const { data } = await supabase
    .from("child_daily_updates")
    .select("child_id")
    .eq("update_date", todayIso());

  return new Set((data ?? []).map((row) => row.child_id));
}

export async function saveChildDailyUpdate(
  childId: string,
  input: ChildDailyUpdateInput,
): Promise<boolean> {
  const daycareId = getCurrentDaycareId();
  if (!isSupabaseConfigured || !supabase || !daycareId) {
    return false;
  }

  const { error } = await supabase.from("child_daily_updates").upsert(
    {
      daycare_id: daycareId,
      child_id: childId,
      update_date: todayIso(),
      meal_breakfast: input.mealBreakfast,
      meal_lunch: input.mealLunch,
      meal_snack: input.mealSnack,
      nap_start: input.napStart || null,
      nap_end: input.napEnd || null,
      mood: input.mood,
      diaper_count: input.diaperCount,
      note: input.note?.trim() || null,
      updated_by: getCurrentUser().id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "child_id,update_date" },
  );

  return !error;
}
