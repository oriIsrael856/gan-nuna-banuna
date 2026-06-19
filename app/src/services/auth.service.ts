import { CLIENT_CONFIG } from "../config/client.config";
import { mockParent, mockParentChildId } from "../data/mockParent";
import type { User, UserRole } from "../types/user";
import { getSessionProfile } from "./session";

export function getCurrentUser(): User {
  const profile = getSessionProfile();
  if (profile) {
    return {
      id: profile.id,
      role: profile.role,
      name: profile.fullName,
      email: profile.email ?? undefined,
      phone: profile.phone ?? undefined,
    };
  }

  return mockParent;
}

export function getCurrentUserRole(): UserRole {
  return getSessionProfile()?.role ?? mockParent.role;
}

export function getCurrentParentChildId(): string {
  return getSessionProfile()?.parentChildId ?? mockParentChildId;
}

export function getCurrentDaycareId(): string | null {
  return getSessionProfile()?.daycareId ?? null;
}

export function getCurrentDaycareName(): string {
  return getSessionProfile()?.daycareName ?? CLIENT_CONFIG.daycareName;
}
