import React, { useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import type { Href } from "expo-router";

import { useAuth } from "../auth/AuthContext";

const SETUP_PREFIX = "/setup";
const PUBLIC_ROUTES = new Set(["/", "/reset-password"]);

/** Redirects admin/teacher to setup wizard until setup is completed. */
export function SetupGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, initializing } = useAuth();

  useEffect(() => {
    if (initializing || !profile) {
      return;
    }

    const isStaff = profile.role === "admin" || profile.role === "teacher";
    const onSetup = pathname.startsWith(SETUP_PREFIX);
    const onPublic = PUBLIC_ROUTES.has(pathname);

    if (isStaff && !profile.setupCompleted && !onSetup && !onPublic) {
      router.replace("/setup/daycare-details" as Href);
      return;
    }

    if (isStaff && profile.setupCompleted && onSetup) {
      router.replace("/teacher/home");
    }
  }, [profile, initializing, pathname, router]);

  return null;
}
