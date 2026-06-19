export type CalendarEventType = "event" | "trip" | "meeting" | "holiday";

export interface CalendarEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  type: CalendarEventType;
  dateIso?: string;
}

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "event-001",
    day: "18",
    month: "מאי",
    title: "טיול לגן החיות",
    time: "09:00 - 13:00",
    type: "trip",
    dateIso: "2026-05-18",
  },
  {
    id: "event-002",
    day: "21",
    month: "מאי",
    title: "חוג חיות",
    time: "16:30",
    type: "event",
    dateIso: "2026-05-21",
  },
  {
    id: "event-003",
    day: "25",
    month: "מאי",
    title: "פגישת הורים",
    time: "18:00",
    type: "meeting",
    dateIso: "2026-05-25",
  },
  {
    id: "event-004",
    day: "29",
    month: "מאי",
    title: "מסיבת סוף שנה",
    time: "17:00",
    type: "event",
    dateIso: "2026-05-29",
  },
  {
    id: "event-005",
    day: "02",
    month: "יוני",
    title: "יום חופש - חג שבועות",
    time: "כל היום",
    type: "holiday",
    dateIso: "2026-06-02",
  },
];
