export interface DailyActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "learning" | "creative" | "movement" | "story" | "outdoor";
  imageUrl?: string;
  catalogId?: string;
}

export interface DailyMeal {
  id: string;
  mealType: "breakfast" | "lunch" | "snack";
  title: string;
  description: string;
  time: string;
}

export interface DailyMessage {
  id: string;
  from: string;
  text: string;
  time: string;
  isRead: boolean;
}

export interface DailyNote {
  id: string;
  childId?: string;
  childName?: string;
  text: string;
  type: "general" | "health" | "behavior" | "sleep";
}

export const mockDailyActivities: DailyActivity[] = [
  {
    id: "activity-001",
    title: "מפגש בוקר",
    description: "שירי בוקר, שיחה קצרה על מזג האוויר והיכרות עם סדר היום.",
    time: "09:00",
    category: "learning",
  },
  {
    id: "activity-002",
    title: "יצירה בצבעי ידיים",
    description: "הילדים יצרו ציורים חופשיים עם צבעים וחומרים רכים.",
    time: "10:30",
    category: "creative",
  },
  {
    id: "activity-003",
    title: "משחק תנועה בחצר",
    description: "פעילות תנועה, קפיצות, ריצה ומשחקי כדור קלים.",
    time: "11:45",
    category: "outdoor",
  },
];

export const mockDailyMeals: DailyMeal[] = [
  {
    id: "meal-001",
    mealType: "breakfast",
    title: "ארוחת בוקר",
    description: "כריך גבינה, ירקות חתוכים ופרי.",
    time: "08:30",
  },
  {
    id: "meal-002",
    mealType: "lunch",
    title: "ארוחת צהריים",
    description: "אורז, קציצות ירק, סלט ומים.",
    time: "12:30",
  },
  {
    id: "meal-003",
    mealType: "snack",
    title: "ארוחת ביניים",
    description: "יוגורט, פרי וקרקרים.",
    time: "15:30",
  },
];

export const mockDailyMessages: DailyMessage[] = [
  {
    id: "message-001",
    from: "רחל כהן",
    text: "נועה תגיע מחר מעט מאוחר יותר.",
    time: "08:12",
    isRead: false,
  },
  {
    id: "message-002",
    from: "מיכל לוי",
    text: "תודה על התמונות מהפעילות היום.",
    time: "13:40",
    isRead: true,
  },
];

export const mockDailyNotes: DailyNote[] = [
  {
    id: "note-001",
    childId: "child-003",
    childName: "תמר גולן",
    text: "לא הגיעה היום עקב מחלה.",
    type: "health",
  },
  {
    id: "note-002",
    childId: "child-004",
    childName: "אורי פרידמן",
    text: "הגיע באיחור קל בבוקר.",
    type: "general",
  },
  {
    id: "note-003",
    childId: "child-006",
    childName: "רון אברהם",
    text: "יצא מוקדם לפגישה אצל רופא.",
    type: "health",
  },
];

export const mockDailyReportSummary = {
  date: "2026-05-17",
  presentChildren: 16,
  totalChildren: 22,
  activitiesCount: mockDailyActivities.length,
  mealsCount: mockDailyMeals.length,
  messagesCount: mockDailyMessages.length,
  notesCount: mockDailyNotes.length,
};