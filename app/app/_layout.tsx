import 'react-native-url-polyfill/auto';
import { useEffect, useRef } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { isRunningInExpoGo } from 'expo';
import { I18nManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';

import { AuthProvider } from '../src/auth/AuthContext';
import { DaycareBrandingProvider } from '../src/daycare/DaycareBrandingContext';
import { NotificationsProvider, useNotifications } from '../src/notifications/NotificationsContext';
import { SetupGate } from '../src/navigation/SetupGate';
import { supabase } from '../src/lib/supabase';

I18nManager.forceRTL(true);

function AppEffects() {
  const router = useRouter();
  const pathname = usePathname();
  const { refresh } = useNotifications();

  // Latest pathname for the listeners below, without re-subscribing on route change.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    // Pushing while already on the screen remounts it mid-typing and wipes input.
    const goToResetPassword = () => {
      if (pathnameRef.current !== '/reset-password') {
        router.push('/reset-password');
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        goToResetPassword();
      }
    });

    const urlListener = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        goToResetPassword();
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
  // Load the icon font before first paint: on iOS Safari (especially when
  // installed to the home screen) icons otherwise render blank until reload.
  const [fontsLoaded] = useFonts(Ionicons.font);
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DaycareBrandingProvider>
          <NotificationsProvider>
            <AppEffects />
            <SetupGate />
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="dark" />
          </NotificationsProvider>
        </DaycareBrandingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
