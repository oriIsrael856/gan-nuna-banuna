import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { isRunningInExpoGo } from 'expo';
import { I18nManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider } from '../src/auth/AuthContext';
import { NotificationsProvider, useNotifications } from '../src/notifications/NotificationsContext';
import { supabase } from '../src/lib/supabase';

I18nManager.forceRTL(true);

function AppEffects() {
  const router = useRouter();
  const { refresh } = useNotifications();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password');
      }
    });

    const urlListener = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        router.push('/reset-password');
      }
    });

    let notificationListener: { remove: () => void } | undefined;

    if (!isRunningInExpoGo()) {
      void import('expo-notifications').then((Notifications) => {
        notificationListener = Notifications.addNotificationReceivedListener(() => {
          refresh();
        });
      });
    }

    return () => {
      authListener.subscription.unsubscribe();
      urlListener.remove();
      notificationListener?.remove();
    };
  }, [refresh, router]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationsProvider>
          <AppEffects />
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="dark" />
        </NotificationsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
