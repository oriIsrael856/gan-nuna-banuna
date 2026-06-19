import type { UserRole } from "../types/user";

export interface SessionProfile {
  id: string;
  role: UserRole;
  daycareId: string | null;
  daycareName: string | null;
  fullName: string;
  phone: string | null;
  email: string | null;
  parentChildId: string | null;
  parentChildIds: string[];
}

let currentProfile: SessionProfile | null = null;

export function setSessionProfile(profile: SessionProfile | null) {
  currentProfile = profile;
}

export function getSessionProfile(): SessionProfile | null {
  return currentProfile;
}

export function clearSessionProfile() {
  currentProfile = null;
}
