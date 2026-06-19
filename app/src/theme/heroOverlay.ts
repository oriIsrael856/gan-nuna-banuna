import { StyleSheet, type TextStyle } from "react-native";

const textShadow: TextStyle = {
  textShadowColor: "rgba(26, 42, 32, 0.65)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 5,
};

export const heroOverlayTextStyles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    ...textShadow,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    marginTop: 2,
    ...textShadow,
  },
  titleLarge: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    ...textShadow,
  },
  subtitleLarge: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    ...textShadow,
  },
});
