import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../auth/AuthContext";
import {
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications.service";

interface NotificationsContextValue {
  unreadCount: number;
  refresh: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    let active = true;
    getUnreadNotificationsCount()
      .then((count) => {
        if (active) {
          setUnreadCount(count);
        }
      })
      .catch(() => {
        if (active) {
          setUnreadCount(0);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Reload whenever the signed-in user changes (login/logout/role switch).
  useEffect(() => {
    const cancel = refresh();
    return cancel;
  }, [refresh, profile?.id]);

  const markRead = useCallback(
    async (id: string) => {
      await markNotificationRead(id);
      refresh();
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    refresh();
  }, [refresh]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ unreadCount, refresh, markRead, markAllRead }),
    [unreadCount, refresh, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
