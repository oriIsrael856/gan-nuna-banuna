import { mockCalendarEvents } from "../data/mockCalendar";
import type { CalendarEvent, CalendarEventType } from "../data/mockCalendar";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getCurrentDaycareId } from "./auth.service";
import { mapCalendarEvent } from "./mappers";

export interface NewCalendarEventInput {
  title: string;
  eventDate: string;
  eventTime?: string;
  type?: CalendarEventType;
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockCalendarEvents;
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("event_date");

  if (error || !data) {
    return [];
  }

  return data.map(mapCalendarEvent);
}

export async function getUpcomingEvents(): Promise<CalendarEvent[]> {
  const events = await getCalendarEvents();
  const today = new Date().toISOString().slice(0, 10);
  return events
    .filter((event) => (event.dateIso ?? "") >= today)
    .sort((a, b) => (a.dateIso ?? "").localeCompare(b.dateIso ?? ""));
}

export async function addCalendarEvent(input: NewCalendarEventInput): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return false;
  }

  const { error } = await supabase.from("calendar_events").insert({
    daycare_id: daycareId,
    title: input.title,
    event_date: input.eventDate,
    event_time: input.eventTime || null,
    type: input.type || "event",
  });

  return !error;
}

export async function updateCalendarEvent(
  id: string,
  input: Partial<NewCalendarEventInput>,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: input.title,
      event_date: input.eventDate,
      event_time: input.eventTime ?? null,
      type: input.type,
    })
    .eq("id", id);

  return !error;
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  return !error;
}
