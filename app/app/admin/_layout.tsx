import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "../../src/auth/AuthContext";

export default function AdminLayout() {
  const { profile, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) {
      return;
    }
    if (profile && profile.role !== "admin") {
      router.replace("/teacher/home");
    }
  }, [profile, initializing, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
