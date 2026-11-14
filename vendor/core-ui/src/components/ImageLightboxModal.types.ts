export interface ImageLightboxModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
  /** Optional array of image sources for multi-photo gallery scrolling */
  images?: string[];
  /** Optional initial index in the images array */
  initialIndex?: number;
  /** Optional change handler when active image changes */
  onIndexChange?: (index: number) => void;
}
