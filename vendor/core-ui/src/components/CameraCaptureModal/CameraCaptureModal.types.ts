export interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
  preferredFacingMode?: 'user' | 'environment';
  initialSource?: 'camera' | 'gallery';
  enableEditor?: boolean;
}
