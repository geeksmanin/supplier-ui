import type * as React from 'react';
import { DynamicDataModel } from '../model/DynamicDataModel';
import { PagePaginationConfig, PaginatedPage } from './pagination';

export type ExportFormat = 'HTML' | 'PDF' | 'EXCEL' | 'WHATSAPP';

export interface TemplateRenderProps<TItem = any> {
  page: PaginatedPage<TItem>;
  model: DynamicDataModel;
  irnQrUrl?: string;
  upiQrUrl?: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description?: string;
  series: string[];                 // e.g. ["B"], ["SO-5"], or ["*"] for all
  targetFormat: 'HTML' | 'EXCEL' | 'TEXT' | 'PDF' | 'Image' | 'Both';
  isActive: boolean;
  isSystemDefault?: boolean;
  paginationConfig?: PagePaginationConfig;
  content?: string;                 // HTML string template
  render?: React.FC<TemplateRenderProps>; // Dedicated React component template
}
