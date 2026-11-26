export interface InventoryStockUpdatedDetail {
  variant_id: string | number;
  location_id?: string;
  passed_quantity?: number;
  available_quantity?: number;
  on_hand_quantity?: number;
}

export interface InventoryBatchUpdatedItem {
  batch_id?: number;
  batch_code: string;
  expiry_date?: string | null;
  mrp?: number;
  location_id?: string;
  location_name?: string;
  available_quantity?: number;
  net_balance?: number;
  purchase_invoice_id?: string;
  purchase_invoice_number?: string;
  supplier_name?: string;
}

export interface InventoryBatchUpdatedDetail {
  variant_id: string | number;
  location_id?: string;
  batches: InventoryBatchUpdatedItem[];
}

export interface InventorySerialUpdatedItem {
  id?: string | number;
  barcode: string;
  serial_no?: string;
  batch_code?: string;
  location_id?: string;
  status?: string;
}

export interface InventorySerialUpdatedDetail {
  variant_id: string | number;
  batch_code?: string;
  location_id?: string;
  serials: Array<string | InventorySerialUpdatedItem>;
}
