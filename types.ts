export enum UserRole {
  QC = 'QC',
  QA = 'QA',
  MANAGER = 'MANAGER'
}

export enum WorkflowState {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  VERIFIED = 'verified',
  LOCKED = 'locked'
}

export interface UserContext {
  user_id: string;
  name: string; // The display name, derived from full_name or email
  full_name?: string | null;
  avatar_url?: string | null;
  email?: string;
  role: UserRole;
  permissions: string[];
  counters?: {
    pending_inspections: number;
    open_ncrs: number;
  };
}

export interface InspectionSummary {
  id: string;
  code: string;
  status: WorkflowState;
  project_reference: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  entity_type: string;
  entity_id: string;
  file_url: string;
  thumbnail_url?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  uploaded_by_id?: string;
  created_at: string;
}

export interface InspectionDetail extends InspectionSummary {
  checklist_json: any;
  results_json: any;
  attachments: Attachment[];
  ncrs?: NCRSummary[];
}

export interface NCRSummary {
  id: string;
  code: string;
  status: WorkflowState;
  severity: 'low' | 'medium' | 'high' | 'critical';
  project_reference: string;
  created_at: string;
  inspection_id: string | null;
}

export interface NCRDetail extends NCRSummary {
  description: string | null;
  root_cause: string | null;
  corrective_action: string | null;
  preventive_action: string | null;
  attachments: Attachment[];
}

export interface IPOSummary {
  id: string;
  ID_Project: string;
  Project_name: string;
  Material_description: string;
  Base_Unit: string;
  Quantity_IPO: number;
  ID_Factory_Order: string;
  Created_on: string | number;
  Quantity: number;
  BOQ_type: string;
  IPO_Number: string;
  IPO_Line: string;
  Ma_Tender: string;
  createdAt: string | number;
  createdBy: string;
  updatedAt: string | number;
  updatedBy: string;
  status: WorkflowState; // Giữ lại để quản lý luồng ISO
}

export interface AuditLogEntry {
  id: number;
  user_context_json: { name: string; email?: string; role: UserRole };
  action: string;
  entity: string;
  entity_id: string;
  new_value: any;
  old_value: any;
  created_at: string;
  notes: string | null;
}