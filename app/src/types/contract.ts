export type ContractStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "signed"
  | "declined"
  | "expired"
  | "error";

export interface Contract {
  id: string;
  childId: string;
  childName: string;
  childAge: string;
  parentName: string;
  fileName: string;
  sentAt: string;
  status: ContractStatus;
  expiryDate?: string;
  activityYear?: string;
  periodStart?: string;
  periodEnd?: string;
  activityDaysPerWeek?: number;
  fileSize?: string;
  filePath?: string;
}
