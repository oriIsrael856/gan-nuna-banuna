import { mockContracts } from "../data/mockContracts";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { Contract, ContractStatus } from "../types/contract";
import type { Database } from "../types/database";
import { getCurrentDaycareId } from "./auth.service";
import { computeAgeLabel, mapContract } from "./mappers";
import { uploadContractFile } from "./storage.service";

export interface NewContractInput {
  childId: string;
  fileName: string;
  expiryDate?: string;
  activityYear?: string;
  fileUri?: string;
  mimeType?: string;
}

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

async function assembleContracts(contractRows: ContractRow[]): Promise<Contract[]> {
  if (!supabase || contractRows.length === 0) {
    return [];
  }

  const sb = supabase;
  const childIds = Array.from(new Set(contractRows.map((row) => row.child_id)));
  const guardianIds = Array.from(
    new Set(
      contractRows
        .map((row) => row.guardian_id)
        .filter((value): value is string => value !== null),
    ),
  );

  const [childResult, guardianResult] = await Promise.all([
    sb.from("children").select("*").in("id", childIds),
    guardianIds.length > 0
      ? sb.from("guardians").select("*").in("id", guardianIds)
      : Promise.resolve({ data: [] as Database["public"]["Tables"]["guardians"]["Row"][] }),
  ]);

  const childById = new Map((childResult.data ?? []).map((row) => [row.id, row]));
  const guardianById = new Map((guardianResult.data ?? []).map((row) => [row.id, row]));

  return contractRows.map((row) => {
    const child = childById.get(row.child_id);
    const guardian = row.guardian_id ? guardianById.get(row.guardian_id) : undefined;
    return mapContract(
      row,
      child?.full_name ?? "",
      computeAgeLabel(child?.birth_date ?? null),
      guardian?.full_name ?? "",
    );
  });
}

export async function getContracts(): Promise<Contract[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockContracts;
  }

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) {
    return [];
  }

  return assembleContracts(data);
}

export async function getContractByChildId(
  childId: string | undefined,
): Promise<Contract | undefined> {
  if (!childId) {
    return undefined;
  }

  if (!isSupabaseConfigured || !supabase) {
    return mockContracts.find((contract) => contract.childId === childId);
  }

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) {
    return undefined;
  }

  const [contract] = await assembleContracts(data);
  return contract;
}

export async function getContractsByStatus(status: ContractStatus): Promise<Contract[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockContracts.filter((contract) => contract.status === status);
  }

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error || !data) {
    return [];
  }

  return assembleContracts(data);
}

export async function createContract(input: NewContractInput): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const daycareId = getCurrentDaycareId();
  if (!daycareId) {
    return false;
  }

  const sb = supabase;

  const { data: links } = await sb
    .from("child_guardians")
    .select("guardian_id, is_primary_contact")
    .eq("child_id", input.childId);

  const primaryLink =
    (links ?? []).find((link) => link.is_primary_contact) ?? (links ?? [])[0];

  let filePath: string | null = null;
  if (input.fileUri) {
    filePath = await uploadContractFile(
      daycareId,
      input.childId,
      input.fileUri,
      input.fileName,
      input.mimeType,
    );
  }

  const { error } = await sb.from("contracts").insert({
    daycare_id: daycareId,
    child_id: input.childId,
    guardian_id: primaryLink?.guardian_id ?? null,
    file_name: input.fileName,
    file_path: filePath,
    status: "sent",
    activity_year: input.activityYear || null,
    sent_at: new Date().toISOString(),
    expiry_date: input.expiryDate || null,
  });

  return !error;
}

export async function updateContract(
  contractId: string,
  input: { fileName?: string; expiryDate?: string | null; activityYear?: string | null },
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from("contracts")
    .update({
      file_name: input.fileName,
      expiry_date: input.expiryDate ?? null,
      activity_year: input.activityYear ?? null,
    })
    .eq("id", contractId);

  return !error;
}

export async function setContractStatus(
  contractId: string,
  status: ContractStatus,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from("contracts")
    .update({ status })
    .eq("id", contractId);

  return !error;
}

export async function deleteContract(contractId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase.from("contracts").delete().eq("id", contractId);
  return !error;
}
