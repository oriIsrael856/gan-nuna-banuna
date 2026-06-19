import type { ContractStatus } from "./contract";

export type AttendanceStatus = "arrived" | "not_arrived" | "late" | "left_early";

export interface Guardian {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  relationshipType: string;
  isPrimaryContact: boolean;
  profileId?: string | null;
  isLinked: boolean;
}

export interface Child {
  id: string;
  name: string;
  age: string;
  birthDate: string;
  gender?: "male" | "female";
  attendanceStatus: AttendanceStatus;
  contractStatus?: ContractStatus;
  guardians?: Guardian[];
  notes?: string;
  avatar?: string;
}
