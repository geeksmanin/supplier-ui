export interface BarcodeQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: any) => void;
  lookupUrl?: string;
  title?: string;
}
