import React from 'react';
import { ProductVariantItem } from '../../hooks/useProductSearch';

export interface ProductSelectProps {
  /** Selected Variant ID (string or number) */
  value?: string | number;
  /** Full selected entity item if available */
  selectedEntity?: ProductVariantItem | null;
  /** Change callback with ID and entity */
  onChange?: (value: string, product: ProductVariantItem | null) => void;
  /** Custom fetcher override */
  fetchEntities?: (query: string) => Promise<ProductVariantItem[]>;
  /** Input placeholder */
  placeholder?: string;
  /** Whether to show barcode scanner trigger in input right element (default true) */
  showScanner?: boolean;
  /** Whether to show compact balance snapshot or preview card (default false) */
  showPreviewCard?: boolean;
  /** Compact mode for chat stream and cards (default false) */
  compact?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Auto focus input */
  autoFocus?: boolean;
  /** Custom container style */
  style?: React.CSSProperties;
  /** Dropdown max height (default '240px') */
  maxListHeight?: string;
  /** Initial options if preloaded */
  initialItems?: ProductVariantItem[];
}
