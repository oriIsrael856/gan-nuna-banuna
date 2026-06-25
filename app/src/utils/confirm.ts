import { Alert, Platform } from "react-native";

/**
 * Shows a Hebrew confirmation dialog and runs `onConfirm` when the user
 * approves. Used for destructive actions (delete) across the app.
 */
export function confirmDelete(message: string, onConfirm: () => void, title = "מחיקה"): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: "ביטול", style: "cancel" },
    { text: "מחיקה", style: "destructive", onPress: onConfirm },
  ]);
}
