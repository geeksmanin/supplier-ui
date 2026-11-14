export interface ImageLightboxModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  images?: string[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onClose: () => void;
}

