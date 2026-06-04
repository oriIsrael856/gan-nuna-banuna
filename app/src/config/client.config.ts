export const CLIENT_CONFIG = {
  clientId: "nuna-banuna",
  appName: "גן נונה בנונה",
  daycareName: "גן נונה בנונה",
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
  supportPhone: "",
  supportEmail: "",
} as const;

export type ClientConfig = typeof CLIENT_CONFIG;
