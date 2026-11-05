export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;
  title: string;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

