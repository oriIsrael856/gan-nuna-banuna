export type NotificationType = "message" | "contract" | "event" | "daily";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  text: string;
  time: string;
  isRead: boolean;
}

export const mockNotifications: AppNotification[] = [
  {
    id: "notif-001",
    type: "contract",
    title: "חוזה ממתין לחתימה",
    text: "החוזה השנתי של נועה ממתין לחתימתך.",
    time: "לפני שעה",
    isRead: false,
  },
  {
    id: "notif-002",
    type: "message",
    title: "הודעה חדשה מהגננת",
    text: "נונה שלחה עדכון על הטיול ביום שלישי.",
    time: "לפני 3 שעות",
    isRead: false,
  },
  {
    id: "notif-003",
    type: "daily",
    title: "סיכום היום עודכן",
    text: "סיכום הפעילויות, הארוחות וההודעות של היום זמין לצפייה.",
    time: "היום, 15:40",
    isRead: false,
  },
  {
    id: "notif-004",
    type: "event",
    title: "אירוע קרוב",
    text: "מסיבת סוף שנה תתקיים ביום חמישי ב-17:00.",
    time: "אתמול",
    isRead: true,
  },
  {
    id: "notif-005",
    type: "message",
    title: "תזכורת",
    text: "נא לזכור להביא בגדים להחלפה.",
    time: "אתמול",
    isRead: true,
  },
];
