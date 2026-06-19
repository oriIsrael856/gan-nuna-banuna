import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Linking from "expo-linking";

import { CLIENT_CONFIG } from "../config/client.config";
import { isDemoLoginEnabled } from "../config/env";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  clearSavedParentChildId,
  loadSavedParentChildId,
  saveParentChildId,
} from "../services/parentChildStorage";
import {
  clearSessionProfile,
  getSessionProfile,
  setSessionProfile,
} from "../services/session";
import type { SessionProfile } from "../services/session";
import type { UserRole } from "../types/user";

interface SignInResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  profile: SessionProfile | null;
  initializing: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signInAsRole: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<SignInResult>;
  setParentChildId: (childId: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function buildMockProfile(role: UserRole): SessionProfile {
  if (role === "teacher") {
    return {
      id: "teacher-001",
      role: "teacher",
      daycareId: null,
      daycareName: CLIENT_CONFIG.daycareName,
      fullName: CLIENT_CONFIG.ownerName || "נונה",
      phone: null,
      email: null,
      parentChildId: null,
      parentChildIds: [],
    };
  }

  return {
    id: "parent-001",
    role: "parent",
    daycareId: null,
    daycareName: CLIENT_CONFIG.daycareName,
    fullName: "רחל כהן",
    phone: "050-1234567",
    email: "rachel.cohen@example.com",
    parentChildId: "child-001",
    parentChildIds: ["child-001"],
  };
}

async function loadProfileForUser(
  userId: string,
  email: string | null,
  savedChildId?: string | null,
): Promise<SessionProfile | null> {
  if (!supabase) {
    return null;
  }

  const { data: profileRow, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profileRow) {
    return null;
  }

  let daycareName: string | null = null;
  if (profileRow.daycare_id) {
    const { data: daycareRow } = await supabase
      .from("daycares")
      .select("name")
      .eq("id", profileRow.daycare_id)
      .single();
    daycareName = daycareRow?.name ?? null;
  }

  let parentChildIds: string[] = [];

  if (profileRow.role === "parent") {
    const { data: guardianRows } = await supabase
      .from("guardians")
      .select("*")
      .eq("profile_id", userId);

    const guardianIds = (guardianRows ?? []).map((row) => row.id);

    if (guardianIds.length > 0) {
      const { data: linkRows } = await supabase
        .from("child_guardians")
        .select("child_id")
        .in("guardian_id", guardianIds);

      parentChildIds = (linkRows ?? []).map((row) => row.child_id);
    }
  }

  const parentChildId =
    profileRow.role === "parent"
      ? (savedChildId && parentChildIds.includes(savedChildId)
          ? savedChildId
          : parentChildIds[0]) ?? null
      : null;

  return {
    id: profileRow.id,
    role: profileRow.role,
    daycareId: profileRow.daycare_id,
    daycareName,
    fullName: profileRow.full_name,
    phone: profileRow.phone,
    email,
    parentChildId,
    parentChildIds,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<SessionProfile | null>(getSessionProfile());
  const [initializing, setInitializing] = useState<boolean>(isSupabaseConfigured);

  const applyProfile = useCallback((next: SessionProfile | null) => {
    setSessionProfile(next);
    setProfile(next);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setInitializing(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!active) {
        return;
      }
      if (session?.user) {
        const savedChildId =
          (await loadSavedParentChildId(session.user.id)) ?? undefined;
        const loaded = await loadProfileForUser(
          session.user.id,
          session.user.email ?? null,
          savedChildId,
        );
        if (active) {
          applyProfile(loaded);
        }
      }
      if (active) {
        setInitializing(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) {
        return;
      }
      if (event === "PASSWORD_RECOVERY") {
        // Session is active after the user opens the reset link.
        return;
      }
      if (session?.user) {
        const savedChildId =
          (await loadSavedParentChildId(session.user.id)) ?? undefined;
        const loaded = await loadProfileForUser(
          session.user.id,
          session.user.email ?? null,
          savedChildId,
        );
        if (active) {
          applyProfile(loaded);
        }
      } else {
        applyProfile(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [applyProfile]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      if (!supabase) {
        return { ok: false, error: "Supabase לא מוגדר." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        return { ok: false, error: error?.message ?? "התחברות נכשלה." };
      }

      const savedChildId =
        (await loadSavedParentChildId(data.user.id)) ?? undefined;
      const loaded = await loadProfileForUser(
        data.user.id,
        data.user.email ?? null,
        savedChildId,
      );

      if (!loaded) {
        return {
          ok: false,
          error: "המשתמש אינו משויך לגן. פנה למנהל המערכת.",
        };
      }

      applyProfile(loaded);
      return { ok: true };
    },
    [applyProfile],
  );

  const signInAsRole = useCallback(
    (role: UserRole) => {
      if (!isDemoLoginEnabled) {
        return;
      }
      applyProfile(buildMockProfile(role));
    },
    [applyProfile],
  );

  const resetPassword = useCallback(async (email: string): Promise<SignInResult> => {
    if (!supabase) {
      return { ok: false, error: "Supabase לא מוגדר." };
    }

    const redirectTo = Linking.createURL("reset-password");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  }, []);

  const setParentChildId = useCallback(
    (childId: string) => {
      const current = getSessionProfile();
      if (!current || current.role !== "parent") {
        return;
      }
      if (!current.parentChildIds.includes(childId)) {
        return;
      }
      applyProfile({ ...current, parentChildId: childId });
      void saveParentChildId(current.id, childId);
    },
    [applyProfile],
  );

  const signOut = useCallback(async () => {
    const current = getSessionProfile();
    if (current?.role === "parent") {
      await clearSavedParentChildId(current.id);
    }
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearSessionProfile();
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      initializing,
      isConfigured: isSupabaseConfigured,
      signIn,
      signInAsRole,
      resetPassword,
      setParentChildId,
      signOut,
    }),
    [profile, initializing, signIn, signInAsRole, resetPassword, setParentChildId, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
