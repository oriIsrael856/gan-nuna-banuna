/** Hero image keys — must match app/src/theme/heroes.ts and storage paths. */
export const HERO_KEYS = [
  "login",
  "parentHome",
  "teacherHome",
  "children",
  "attendance",
  "dailySummary",
  "teacherContracts",
  "uploadContract",
  "parentContract",
] as const;

export type HeroKey = (typeof HERO_KEYS)[number];

export const HERO_LABELS: Record<HeroKey, string> = {
  login: "מסך כניסה",
  parentHome: "בית הורים",
  teacherHome: "בית גננת",
  children: "רשימת ילדים",
  attendance: "נוכחות",
  dailySummary: "סיכום יום",
  teacherContracts: "חוזים",
  uploadContract: "העלאת חוזה",
  parentContract: "חוזה הורה",
};
