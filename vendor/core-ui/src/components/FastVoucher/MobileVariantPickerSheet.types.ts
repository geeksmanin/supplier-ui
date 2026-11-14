import { VoucherLineItem } from './FastVoucherEntryLayout.types';

export interface MobileVariantPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onAddVariants: (items: VoucherLineItem[]) => void;
}
