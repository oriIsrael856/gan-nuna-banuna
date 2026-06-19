import type { CalendarEvent, CalendarEventType } from "../data/mockCalendar";
import type { DailyActivity, DailyMeal, DailyNote } from "../data/mockDailyReports";
import type { ChatMessage } from "../data/mockMessages";
import type { AppNotification, NotificationType } from "../data/mockNotifications";
import type { AttendanceStatus, Child, Guardian } from "../types/child";
import type { Contract, ContractStatus } from "../types/contract";
import type { Database } from "../types/database";

type ChildRow = Database["public"]["Tables"]["children"]["Row"];
type GuardianRow = Database["public"]["Tables"]["guardians"]["Row"];
type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];
type ActivityRow = Database["public"]["Tables"]["daily_activities"]["Row"];
type MealRow = Database["public"]["Tables"]["daily_meals"]["Row"];
type NoteRow = Database["public"]["Tables"]["daily_notes"]["Row"];
type CalendarRow = Database["public"]["Tables"]["calendar_events"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

type MessageWithSender = MessageRow & {
  profiles?: { full_name: string } | null;
};

const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

export function formatTimeHHMM(iso: string): string {
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function computeAgeLabel(birthDate: string | null): string {
  if (!birthDate) {
    return "";
  }

  const birth = new Date(birthDate);
  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }
  months = Math.max(months, 0);

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const half = remainder >= 6;

  if (years <= 0) {
    const count = Math.max(months, 1);
    return `${count} חודשים`;
  }
  if (years === 1) {
    return half ? "שנה וחצי" : "שנה";
  }
  if (years === 2) {
    return half ? "שנתיים וחצי" : "שנתיים";
  }
  return half ? `${years} שנים וחצי` : `${years} שנים`;
}

export function mapGuardian(row: GuardianRow, isPrimaryContact: boolean): Guardian {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone ?? "",
    email: row.email ?? undefined,
    relationshipType: row.relationship_type,
    isPrimaryContact,
    profileId: row.profile_id ?? null,
    isLinked: Boolean(row.profile_id),
  };
}

export function mapChild(
  row: ChildRow,
  guardians: Guardian[],
  attendanceStatus: AttendanceStatus,
  contractStatus?: ContractStatus,
): Child {
  return {
    id: row.id,
    name: row.full_name,
    age: computeAgeLabel(row.birth_date),
    birthDate: row.birth_date ?? "",
    gender: row.gender ?? undefined,
    attendanceStatus,
    contractStatus,
    guardians: guardians.length > 0 ? guardians : undefined,
    notes: row.notes ?? undefined,
  };
}

export function mapContract(
  row: ContractRow,
  childName: string,
  childAge: string,
  parentName: string,
): Contract {
  return {
    id: row.id,
    childId: row.child_id,
    childName,
    childAge,
    parentName,
    fileName: row.file_name,
    filePath: row.file_path ?? undefined,
    sentAt: row.sent_at ?? row.created_at,
    status: row.status,
    expiryDate: row.expiry_date ?? undefined,
    activityYear: row.activity_year ?? undefined,
    periodStart: row.period_start ?? undefined,
    periodEnd: row.period_end ?? undefined,
  };
}

const ACTIVITY_CATEGORIES: DailyActivity["category"][] = [
  "learning",
  "creative",
  "movement",
  "story",
  "outdoor",
];

export function mapActivity(row: ActivityRow, imageUrl?: string | null): DailyActivity {
  const category = ACTIVITY_CATEGORIES.includes(row.category as DailyActivity["category"])
    ? (row.category as DailyActivity["category"])
    : "learning";

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    time: (row.activity_time ?? "").slice(0, 5),
    category,
    imageUrl: imageUrl ?? undefined,
    catalogId: row.catalog_id ?? undefined,
  };
}

const MEAL_TYPES: DailyMeal["mealType"][] = ["breakfast", "lunch", "snack"];

export function mapMeal(row: MealRow): DailyMeal {
  const mealType = MEAL_TYPES.includes(row.meal_type as DailyMeal["mealType"])
    ? (row.meal_type as DailyMeal["mealType"])
    : "snack";

  return {
    id: row.id,
    mealType,
    title: row.title,
    description: row.description ?? "",
    time: (row.meal_time ?? "").slice(0, 5),
  };
}

const NOTE_TYPES: DailyNote["type"][] = ["general", "health", "behavior", "sleep"];

export function mapNote(row: NoteRow, childName?: string): DailyNote {
  const type = NOTE_TYPES.includes(row.note_type as DailyNote["type"])
    ? (row.note_type as DailyNote["type"])
    : "general";

  return {
    id: row.id,
    childId: row.child_id ?? undefined,
    childName,
    text: row.text,
    type,
  };
}

const CALENDAR_TYPES: CalendarEventType[] = ["event", "trip", "meeting", "holiday"];

export function mapCalendarEvent(row: CalendarRow): CalendarEvent {
  const date = new Date(row.event_date);
  const type = CALENDAR_TYPES.includes(row.type as CalendarEventType)
    ? (row.type as CalendarEventType)
    : "event";

  return {
    id: row.id,
    day: String(date.getDate()).padStart(2, "0"),
    month: HEBREW_MONTHS[date.getMonth()] ?? "",
    title: row.title,
    time: row.event_time ?? "",
    type,
    dateIso: row.event_date,
  };
}

const NOTIFICATION_TYPES: NotificationType[] = ["message", "contract", "event", "daily"];

export function mapNotification(row: NotificationRow): AppNotification {
  const type = NOTIFICATION_TYPES.includes(row.type as NotificationType)
    ? (row.type as NotificationType)
    : "message";

  return {
    id: row.id,
    type,
    title: row.title,
    text: row.body ?? "",
    time: new Date(row.created_at).toLocaleString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    isRead: row.is_read,
  };
}

export function resolveSenderInitial(
  senderName: string | null | undefined,
  fallbackTitle?: string,
): string {
  if (senderName?.trim()) {
    return senderName.trim().slice(0, 1);
  }
  if (fallbackTitle?.trim()) {
    return fallbackTitle.trim().slice(0, 1);
  }
  return "צ";
}

export function mapChatMessage(
  row: MessageWithSender,
  currentProfileId: string | null,
  fallbackTitle?: string,
): ChatMessage {
  const senderName = row.profiles?.full_name ?? undefined;
  const senderInitial = resolveSenderInitial(senderName, fallbackTitle);

  return {
    id: row.id,
    fromMe: currentProfileId !== null && row.sender_id === currentProfileId,
    text: row.body,
    time: formatTimeHHMM(row.created_at),
    senderInitial,
    senderName,
  };
}
