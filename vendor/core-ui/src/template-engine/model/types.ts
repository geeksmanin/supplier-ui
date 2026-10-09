export type KeyDataType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

export interface CollectionItemField {
  key: string;              // Field property, e.g. "Name", "SalePrice", "Discount", "HSN", "Qty"
  label: string;            // Human-readable title: "Item Name", "Sale Price"
  type: KeyDataType;        // 'string' | 'number' | etc.
  description?: string;
  sampleValue?: any;
}

export interface CollectionOptions {
  label?: string;
  itemPrefix?: string;      // e.g. "item" -> generates "item.Name", "item.SalePrice"
  fields?: CollectionItemField[];
  category?: string;
}

export interface AvailableKey {
  key: string;              // Full token, e.g. "doc.no", "party.name", "item.Name"
  label: string;            // Human-readable label
  type: KeyDataType;        // Data type
  sampleValue?: any;        // Live sample value from data
  category?: string;        // "Document", "Party", "Logistics", "Totals", "Item Fields"
  isCollectionItem?: boolean;// True if this belongs to an array item (e.g. item.Name)
  collectionName?: string;  // e.g. "items"
  fields?: AvailableKey[];  // Child fields if type === 'array'
}

export interface KeyRegistrationMeta {
  label?: string;
  type?: KeyDataType;
  category?: string;
  description?: string;
}
