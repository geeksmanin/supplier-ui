// Core Model & Introspection
export { DynamicDataModel } from './model/DynamicDataModel';
export type {
  AvailableKey,
  KeyDataType,
  CollectionItemField,
  CollectionOptions,
  KeyRegistrationMeta,
} from './model/types';

// Pagination & Chunking Engine
export {
  paginateCollection,
  DEFAULT_PAGINATION_CONFIG,
} from './engine/pagination';
export type {
  PagePaginationConfig,
  PaginatedPage,
} from './engine/pagination';

// QR Code Engine (IRN & UPI)
export {
  generateQrCodeDataUrl,
  generateUpiQrCodeDataUrl,
  buildUpiPaymentUrl,
} from './engine/qrEngine';
export type {
  QROptions,
  UpiPaymentOptions,
} from './engine/qrEngine';

// Template Engine, Interpolator & Resolver
export { TemplateResolver } from './engine/TemplateResolver';
export { interpolateTemplate } from './engine/interpolator';
export { DEFAULT_STARTER_HTML_TEMPLATE } from './engine/starterTemplates';
export type {
  TemplateDefinition,
  TemplateRenderProps,
  ExportFormat,
} from './engine/types';

// Export Engine (Images, PDFs, and Git Code Generation)
export {
  exportPageToImageBlob,
  exportPagesToPdfBlob,
  generateTemplateCode,
  downloadTemplateCode,
  downloadBlob,
  waitForImagesToLoad,
} from './engine/exportEngine';

// React Hooks
export { useTemplateEngine } from './hooks/useTemplateEngine';
export type {
  UseTemplateEngineOptions,
  UseTemplateEngineReturn,
} from './hooks/useTemplateEngine';

// UI Modals & Inspectors
export { AvailableKeysInspector } from './components/AvailableKeysInspector';
export type { AvailableKeysInspectorProps } from './components/AvailableKeysInspector';

export { ExportTemplateModal } from './components/ExportTemplateModal';
export type { ExportTemplateModalProps } from './components/ExportTemplateModal';

export { TemplateEditorModal } from './components/TemplateEditorModal';
export type { TemplateEditorModalProps } from './components/TemplateEditorModal';

export { TemplateEditorPage } from './components/TemplateEditorPage';
export type { TemplateEditorPageProps } from './components/TemplateEditorPage';

export { VoucherDetailsModal } from './components/VoucherDetailsModal';
export type { VoucherDetailsModalProps } from './components/VoucherDetailsModal';

// Utilities & Asset Resolution
export { resolveAssetUrl } from './utils/assetResolver';

// Formatters
export {
  formatINR,
  formatDecimal,
  numberToWordsINR,
} from './formatters/currency';
export {
  formatDate,
  formatTime,
} from './formatters/dates';
