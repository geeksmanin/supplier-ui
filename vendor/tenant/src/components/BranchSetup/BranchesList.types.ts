import React from 'react';

export interface Branch {
  id: string;
  code: string;
  name: string;
  parent_branch_id?: string;
  holiday_calendar?: string;
  is_head_office: boolean;
  gstin?: string;
  phone?: string;
  email?: string;
  default_location_id?: string;
  storage_facility_id?: string;
  default_sellable_location_id?: string;
  default_qc_location_id?: string;
  default_damaged_location_id?: string;
  default_gate_location_id?: string;
  order_prefix_override?: string;
  invoice_prefix_override?: string;
  is_active: boolean;
}

export interface BranchesListProps {
  branches: Branch[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onCreate: (parentBranchId?: string) => void;
  onEdit: (id: string) => void;
}
