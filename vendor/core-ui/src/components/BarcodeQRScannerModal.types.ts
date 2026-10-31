export interface BarcodeQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: any) => void;
  /** Optional custom API lookup URL (e.g. "/catalogue/variants") */
  lookupUrl?: string;
  /** Custom title for scanner */
  title?: string;
  /** Custom subtitle for scanner */
  subtitle?: string;
  /** Toggle whether to display hardware gun / manual text input field (default: true) */
  showTextInput?: boolean;
  /** Whether to render as an immersive full-screen scanner (default: true) */
  fullscreen?: boolean;
  /** Placeholder for manual text input */
  inputPlaceholder?: string;
  /** Label for manual text input */
  inputLabel?: string;
}
