export interface ChatMessage {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  senderInitial: string;
  senderName?: string;
}

export interface MessageThread {
  id: string;
  name: string;
  subtitle: string;
  avatarInitial: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  kind: "broadcast" | "direct";
  parentProfileId?: string;
  messages: ChatMessage[];
}

export const mockMessageThreads: MessageThread[] = [
  {
    id: "thread-001",
    name: "נונה - הגננת",
    subtitle: "גן נונה בנונה",
    avatarInitial: "נ",
    lastMessage: "מחר נצא לטיול, נא להביא כובע ובקבוק מים.",
    lastTime: "15:20",
    unreadCount: 2,
    kind: "broadcast",
    messages: [
      {
        id: "m-001",
        fromMe: false,
        text: "בוקר טוב! נועה הגיעה בשמחה הבוקר.",
        time: "08:30",
        senderInitial: "נ",
        senderName: "נונה",
      },
      {
        id: "m-002",
        fromMe: true,
        text: "בוקר טוב, תודה על העדכון!",
        time: "08:42",
        senderInitial: "א",
      },
      {
        id: "m-003",
        fromMe: false,
        text: "היא נהנתה מאוד מפעילות היצירה.",
        time: "11:05",
        senderInitial: "נ",
        senderName: "נונה",
      },
      {
        id: "m-004",
        fromMe: false,
        text: "מחר נצא לטיול, נא להביא כובע ובקבוק מים.",
        time: "15:20",
        senderInitial: "נ",
        senderName: "נונה",
      },
    ],
  },
  {
    id: "thread-002",
    name: "הנהלת הגן",
    subtitle: "הודעות כלליות",
    avatarInitial: "ה",
    lastMessage: "מסיבת סוף שנה ביום חמישי ב-17:00.",
    lastTime: "אתמול",
    unreadCount: 0,
    kind: "broadcast",
    messages: [
      {
        id: "m-101",
        fromMe: false,
        text: "שלום הורים יקרים, מצרפים עדכון לשבוע הקרוב.",
        time: "אתמול 09:00",
        senderInitial: "ה",
        senderName: "הנהלת הגן",
      },
      {
        id: "m-102",
        fromMe: false,
        text: "מסיבת סוף שנה ביום חמישי ב-17:00.",
        time: "אתמול 09:01",
        senderInitial: "ה",
        senderName: "הנהלת הגן",
      },
    ],
  },
  {
    id: "thread-003",
    name: "צוות המטבח",
    subtitle: "תזונה ותפריט",
    avatarInitial: "מ",
    lastMessage: "התפריט השבועי החדש פורסם.",
    lastTime: "יום ראשון",
    unreadCount: 0,
    kind: "broadcast",
    messages: [
      {
        id: "m-201",
        fromMe: false,
        text: "התפריט השבועי החדש פורסם.",
        time: "יום ראשון 12:00",
        senderInitial: "מ",
        senderName: "צוות המטבח",
      },
    ],
  },
];
