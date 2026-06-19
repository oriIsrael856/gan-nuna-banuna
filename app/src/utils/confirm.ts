import { Alert } from "react-native";

/**
 * Shows a Hebrew confirmation dialog and runs `onConfirm` when the user
 * approves. Used for destructive actions (delete) across the app.
 */
export function confirmDelete(message: string, onConfirm: () => void, title = "מחיקה"): void {
  Alert.alert(title, message, [
    { text: "ביטול", style: "cancel" },
    { text: "מחיקה", style: "destructive", onPress: onConfirm },
  ]);
}
