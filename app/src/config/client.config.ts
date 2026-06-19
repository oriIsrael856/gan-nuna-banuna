export const CLIENT_CONFIG = {
  clientId: "nuna-banuna",
  appName: "גן נונה בנונה",
  daycareName: "גן נונה בנונה",
  homeSubtitle: "האפליקציה האישית של הגן",
  homeTagline: "כל מה שהגננת וההורים צריכים, במקום אחד",
  ownerName: "נונה",
  logoInitial: "נ",
  primaryColor: "#7A9A72",
  secondaryColor: "#F4D6C6",
  backgroundColor: "#FFF8F1",
  cardBackgroundColor: "#FFFFFF",
  textPrimary: "#26382E",
  textSecondary: "#6B6B6B",
  warningColor: "#E8A75D",
  errorColor: "#D96B6B",
  supportPhone: "03-1234567",
  supportEmail: "info@gan-nuna.co.il",
  privacyPolicyUrl: "",
  termsUrl: "",
} as const;

export type ClientConfig = typeof CLIENT_CONFIG;
