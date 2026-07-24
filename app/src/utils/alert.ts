import { Alert, Platform } from "react-native";
import type { AlertButton } from "react-native";

/**
 * Cross-platform replacement for Alert.alert.
 * React Native Web's Alert is a no-op, so on web we fall back to
 * window.alert / window.confirm and still invoke the button callbacks.
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const text = message ? `${title}\n\n${message}` : title;

  if (!buttons || buttons.length === 0) {
    window.alert(text);
    return;
  }

  if (buttons.length === 1) {
    window.alert(text);
    buttons[0].onPress?.();
    return;
  }

  const cancelButton = buttons.find((button) => button.style === "cancel");
  const confirmButton =
    [...buttons].reverse().find((button) => button !== cancelButton) ?? buttons[buttons.length - 1];

  if (window.confirm(text)) {
    confirmButton.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}
