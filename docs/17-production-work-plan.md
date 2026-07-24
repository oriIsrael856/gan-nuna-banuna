# Production Work Plan — סגירת פערים ליציאה לטסטים

עודכן: 2026-07-24. מבוסס על אודיט קוד בפועל (לא על התיעוד הישן — חלקו לא היה מעודכן).

## מה נמצא באודיט (סטטוס אמיתי)

| נושא | סטטוס |
|---|---|
| נוכחות, דיווח היעדרות, חוזים (חתימה ידנית + signed URL) | ✅ מחוברים ל-Supabase באמת — התיעוד הישן היה שגוי |
| כפתורי דמו מוסתרים כש-Supabase מוגדר | ✅ (`app/app/index.tsx` + `isDemoLoginEnabled`) |
| `.env` ב-gitignore | ✅ |
| תמונות hero | ✅ הוחלפו באמיתיות תחת `app/assets/heroes/` — התיעוד הישן היה שגוי |
| typecheck + lint | ✅ עוברים נקי (תוקנו 2 שגיאות ו-5 אזהרות ב-2026-07-24) |
| שדה אלרגיות | ✅ נוסף מקצה לקצה ב-2026-07-24 (ראו למטה) |

## מה בוצע (2026-07-24)

1. תיקוני lint: `setup/complete.tsx`, `SetupGate.tsx`, `cameras.tsx`, `album/[id].tsx`, `calendar.tsx`, `DaycareBrandingContext.tsx`.
2. **שדה אלרגיות ורגישויות**:
   - מיגרציה `supabase/migrations/0013_child_allergies.sql` (טרם הורצה ב-Supabase!)
   - `database.ts`, `child.ts`, `mappers.ts`, `children.service.ts`
   - טופס הוספת/עריכת ילד (`add-child.tsx`) — שדה ייעודי
   - כרטיס ילד (`ChildProfile.tsx`) — כרטיס אזהרה אדום בולט כשקיימות אלרגיות

## שלב 1 — תשתית (ידני, ~חצי יום) — חוסם טסטים

- [ ] להריץ מיגרציה `0013_child_allergies.sql` ב-SQL Editor (אחרי 0001–0012)
- [ ] לוודא `app/.env` מול פרויקט Supabase אמיתי
- [ ] EAS Secrets: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] לפרוס edge functions: `invite-parent`, `invite-teacher`, `provision-daycare`, `send-push-notification` (+ `get-camera-stream` אם מצלמות בסקופ הטסטים)
- [ ] Realtime על `messages` (Database → Replication)
- [ ] Auth redirect: `gan-nuna-banuna://reset-password`
- [ ] `eas init` → `extra.eas.projectId` ב-`app.json` (ל-push)

## שלב 2 — בילד לטסטרים (~חצי יום)

- [ ] `npx eas build --profile preview --platform android` → APK להפצה פנימית
- [ ] `npx eas build --profile development` למכשיר אחד לבדיקת push
- [ ] לוודא שהבילד לא מציג כפתורי דמו

## שלב 3 — QA מקוצר לפני הפצה לטסטרים (יום)

ריצה חד-פעמית של הקריטי מתוך `docs/13-pilot-qa-checklist.md`:
- [ ] גננת: לוגין → הוספת ילד (כולל אלרגיות) → הזמנת הורה → ההורה נכנס
- [ ] נוכחות נשמרת אחרי רענון; אלרגיה מופיעה בכרטיס הילד
- [ ] חוזה: העלאה → ההורה פותח PDF → אישור חתימה
- [ ] הודעות: ברודקאסט + ישיר, Realtime בין שני מכשירים
- [ ] RLS: הורה ב' לא רואה את הילד/שיחה של הורה א'
- [ ] שחזור סיסמה עם deep link

## שלב 4 — במהלך הטסטים (מקביל)

- [ ] ריצת הצ'קליסט המלא `docs/13-pilot-qa-checklist.md` על iOS + Android
- [ ] תיקון באגים מהטסטרים
- [ ] URLs חיים למדיניות פרטיות + תנאי שימוש (חוסם חנויות, לא חוסם טסטים)

## לא עכשיו (החלטה מודעת)

- הגשה לחנויות — אחרי שהטסטים יציבים
- חתימה דיגיטלית אמיתית, מעקב תשלומים, שעון נוכחות צוות — גרסה 1.1 (ראו השוואת מתחרים)
- סליקה וחשבוניות — גרסה 2
- שדרוג Expo בגלל npm audit — בנפרד
