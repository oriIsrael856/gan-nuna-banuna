import { mockChildren } from "../data/mockChildren";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { AttendanceStatus, Child, Guardian } from "../types/child";
import type { ContractStatus } from "../types/contract";
import type { Database } from "../types/database";
import { getCurrentDaycareId } from "./auth.service";
import { inviteParent, type InviteParentResult } from "./invite.service";
import { mapChild, mapGuardian, todayIso } from "./mappers";

export interface NewChildGuardianInput {
  fullName: string;
  phone?: string;
  email?: string;
  relationshipType: string;
  isPrimaryContact: boolean;
}

export interface NewChildInput {
  fullName: string;
  birthDate?: string;
  gender?: "male" | "female";
  notes?: string;
  guardians: NewChildGuardianInput[];
}

type ChildRow = Database["public"]["Tables"]["children"]["Row"];

async function assembleChildren(childRows: ChildRow[]): Promise<Child[]> {
  if (!supabase || childRows.length === 0) {
    return [];
  }

  const sb = supabase;
  const childIds = childRows.map((row) => row.id);

  const [linkResult, guardianResult, attendanceResult, contractResult] = await Promise.all([
    sb.from("child_guardians").select("*").in("child_id", childIds),
    sb.from("guardians").select("*"),
    sb
      .from("attendance_records")
      .select("*")
      .eq("attendance_date", todayIso())
      .in("child_id", childIds),
    sb.from("contracts").select("*").in("child_id", childIds),
  ]);

  const links = linkResult.data ?? [];
  const guardianRows = guardianResult.data ?? [];
  const attendance = attendanceResult.data ?? [];
  const contracts = contractResult.data ?? [];

  const guardianById = new Map(guardianRows.map((row) => [row.id, row]));

  return childRows.map((row) => {
    const childLinks = links.filter((link) => link.child_id === row.id);
    const guardians: Guardian[] = childLinks
      .map((link) => {
        const guardianRow = guardianById.get(link.guardian_id);
        return guardianRow ? mapGuardian(guardianRow, link.is_primary_contact) : null;
      })
      .filter((value): value is Guardian => value !== null)
      .sort((a, b) => Number(b.isPrimaryContact) - Number(a.isPrimaryContact));

    const attendanceStatus: AttendanceStatus =
      (attendance.find((record) => record.child_id === row.id)?.status as AttendanceStatus) ??
      "not_arrived";

    const contractStatus = contracts.find((contract) => contract.child_id === row.id)
      ?.status as ContractStatus | undefined;

    return mapChild(row, guardians, attendanceStatus, contractStatus);
  });
}

export async function getChildren(): Promise<Child[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockChildren;
  }

  const { data, error } = await supabase.from("children").select("*").order("full_name");
  if (error || !data) {
    return [];
  }

  return assembleChildren(data);
}

export async function getChildById(childId: string | undefined): Promise<Child | undefined> {
  if (!childId) {
    return undefined;
  }

  if (!isSupabaseConfigured || !supabase) {
    return mockChildren.find((child) => child.id === childId);
  }

  const { data, error } = await supabase.from("children").select("*").eq("id", childId).single();
  if (error || !data) {
    return undefined;
  }

  const [child] = await assembleChildren([data]);
  return child;
}

export interface AddChildResult {
  ok: boolean;
  childId?: string;
  invite?: InviteParentResult;
}

export async function addChild(input: NewChildInput): Promise<AddChildResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: true };
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return { ok: false };
  }

  const sb = supabase;
  const { data: childRow, error: childError } = await sb
    .from("children")
    .insert({
      daycare_id: daycareId,
      full_name: input.fullName,
      birth_date: input.birthDate || null,
      gender: input.gender ?? null,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (childError || !childRow) {
    return { ok: false };
  }

  let inviteResult: InviteParentResult | undefined;
  for (const guardian of input.guardians) {
    const guardianId = await addGuardian(childRow.id, guardian);
    if (guardian.isPrimaryContact && guardianId && guardian.email?.trim()) {
      inviteResult = await inviteParent({
        email: guardian.email.trim(),
        fullName: guardian.fullName,
        phone: guardian.phone,
        guardianId,
        daycareId,
      });
    }
  }

  return { ok: true, childId: childRow.id, invite: inviteResult };
}

export async function updateChild(
  childId: string,
  input: {
    fullName?: string;
    birthDate?: string | null;
    gender?: "male" | "female" | null;
    notes?: string | null;
  },
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from("children")
    .update({
      full_name: input.fullName,
      birth_date: input.birthDate ?? null,
      gender: input.gender ?? null,
      notes: input.notes ?? null,
    })
    .eq("id", childId);

  return !error;
}

export async function deleteChild(childId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.from("children").delete().eq("id", childId);
  return !error;
}

export async function addGuardian(
  childId: string,
  guardian: NewChildGuardianInput,
): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return null;
  }

  const sb = supabase;
  const { data: guardianRow, error } = await sb
    .from("guardians")
    .insert({
      daycare_id: daycareId,
      full_name: guardian.fullName,
      phone: guardian.phone || null,
      email: guardian.email || null,
      relationship_type: guardian.relationshipType,
    })
    .select("id")
    .single();

  if (error || !guardianRow) {
    return null;
  }

  const { error: linkError } = await sb.from("child_guardians").insert({
    child_id: childId,
    guardian_id: guardianRow.id,
    is_primary_contact: guardian.isPrimaryContact,
  });

  return linkError ? null : guardianRow.id;
}

export async function updateGuardian(
  guardianId: string,
  input: {
    fullName?: string;
    phone?: string | null;
    email?: string | null;
    relationshipType?: string;
  },
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from("guardians")
    .update({
      full_name: input.fullName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      relationship_type: input.relationshipType,
    })
    .eq("id", guardianId);

  return !error;
}

export async function removeGuardian(guardianId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.from("guardians").delete().eq("id", guardianId);
  return !error;
}
