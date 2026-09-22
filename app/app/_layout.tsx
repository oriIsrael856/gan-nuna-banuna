import 'react-native-url-polyfill/auto';
import { useEffect, useRef } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { isRunningInExpoGo } from 'expo';
import { I18nManager, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import type { FontSource } from 'expo-font';
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

// On web the bundled icon font lands under assets/node_modules/, which the
// hosting strips from deployments (404). Registering the family from the
// statically served copy first makes @expo/vector-icons skip its own
// injection of the broken URL. Native keeps the bundled asset.
const WEB_ICON_FONTS: Record<string, FontSource> =
  Platform.OS === 'web' ? { ionicons: { uri: '/fonts/Ionicons.ttf' } } : {};

export default function RootLayout() {
  const [iconFontReady] = useFonts(WEB_ICON_FONTS);
  if (!iconFontReady) {
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
