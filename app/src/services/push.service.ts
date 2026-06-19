import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { isRunningInExpoGo } from "expo";

import { isSupabaseConfigured, supabase } from "../lib/supabase";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null = null;
let handlerConfigured = false;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (isRunningInExpoGo()) {
    return null;
  }

  if (!notificationsModule) {
    notificationsModule = await import("expo-notifications");
  }

  if (!handlerConfigured && notificationsModule) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }

  return notificationsModule;
}

/** Push tokens require a development build — not supported in Expo Go (SDK 53+). */
export function isPushAvailableInCurrentRuntime(): boolean {
  return !isRunningInExpoGo() && Device.isDevice;
}

async function getExpoPushToken(): Promise<string | null> {
  if (!isPushAvailableInCurrentRuntime()) {
    return null;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

export async function registerPushToken(profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  const token = await getExpoPushToken();
  if (!token) {
    return false;
  }

  const { error } = await supabase.from("push_tokens").upsert(
    {
      profile_id: profileId,
      token,
      platform: Platform.OS,
    },
    { onConflict: "profile_id,token", ignoreDuplicates: false },
  );

  return !error;
}

export async function unregisterPushToken(profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.from("push_tokens").delete().eq("profile_id", profileId);
  return !error;
}
