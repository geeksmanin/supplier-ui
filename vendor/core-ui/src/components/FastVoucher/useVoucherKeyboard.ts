import { useEffect, RefObject } from 'react';

interface UseVoucherKeyboardProps {
  partyInputRef?: RefObject<HTMLInputElement | HTMLElement | null>;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  discountInputRef?: RefObject<HTMLInputElement | null>;
  freightInputRef?: RefObject<HTMLInputElement | null>;
  tableRef?: RefObject<HTMLDivElement | null>;
  isStepperOpen?: boolean;
  isDrawerOpen?: boolean;
  isModalOpen?: boolean;
  itemsCount: number;
  focusedRowIndex: number | null;
  setFocusedRowIndex: (idx: number | null | ((prev: number | null) => number | null)) => void;
  onFocusParty?: () => void;
  onFocusSearch?: () => void;
  onFocusDiscount?: () => void;
  onFocusFreight?: () => void;
  onToggleDrawer?: () => void;
  onParkBill?: () => void;
  onRecallBillModal?: () => void;
  onSubmit?: () => void;
  onEditRow?: (index: number) => void;
  onDeleteRow?: (index: number) => void;
  onCloseStepper?: () => void;
  onCloseDrawer?: () => void;
}

export const useVoucherKeyboard = ({
  partyInputRef,
  searchInputRef,
  discountInputRef,
  freightInputRef,
  tableRef,
  isStepperOpen = false,
  isDrawerOpen = false,
  isModalOpen = false,
  itemsCount,
  focusedRowIndex,
  setFocusedRowIndex,
  onFocusParty,
  onFocusSearch,
  onFocusDiscount,
  onFocusFreight,
  onToggleDrawer,
  onParkBill,
  onRecallBillModal,
  onSubmit,
  onEditRow,
  onDeleteRow,
  onCloseStepper,
  onCloseDrawer,
}: UseVoucherKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. If any blocking modal is open, only intercept Esc
      if (isModalOpen) {
        return;
      }

      // 2. Global Hotkey: F2 or Alt+C (Party Selection)
      if (e.key === 'F2' || (e.altKey && e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        if (onFocusParty) {
          onFocusParty();
        } else if (partyInputRef?.current) {
          partyInputRef.current.focus();
        }
        return;
      }

      // 3. Global Hotkey: F3 (Toggle Details Drawer)
      if (e.key === 'F3') {
        e.preventDefault();
        onToggleDrawer?.();
        return;
      }

      // 4. Global Hotkey: F4 or Ctrl+K (Product Search)
      if (e.key === 'F4' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        if (onFocusSearch) {
          onFocusSearch();
        } else if (searchInputRef?.current) {
          searchInputRef.current.focus();
        }
        setFocusedRowIndex(null);
        return;
      }

      // 5. Global Hotkey: F6 (Park / Hold Bill)
      if (e.key === 'F6') {
        e.preventDefault();
        onParkBill?.();
        return;
      }

      // 6. Global Hotkey: F7 (Recall Parked Bills)
      if (e.key === 'F7') {
        e.preventDefault();
        onRecallBillModal?.();
        return;
      }

      // 6a. Hotkey: Alt+D (Focus Document Discount)
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (onFocusDiscount) {
          onFocusDiscount();
        } else if (discountInputRef?.current) {
          discountInputRef.current.focus();
          discountInputRef.current.select();
        }
        return;
      }

      // 6b. Hotkey: Alt+F (Focus Freight / Shipping)
      if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (onFocusFreight) {
          onFocusFreight();
        } else if (freightInputRef?.current) {
          freightInputRef.current.focus();
          freightInputRef.current.select();
        }
        return;
      }

      // 7. Global Hotkey: F10 or Ctrl+Enter / Cmd+Enter (Submit / Post Document)
      if (e.key === 'F10' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        onSubmit?.();
        return;
      }

      // 8. Escape: Dismiss Stepper or Drawer, return focus to Product Search
      if (e.key === 'Escape') {
        if (isStepperOpen) {
          e.preventDefault();
          onCloseStepper?.();
          searchInputRef?.current?.focus();
          return;
        }
        if (isDrawerOpen) {
          e.preventDefault();
          onCloseDrawer?.();
          searchInputRef?.current?.focus();
          return;
        }
        if (focusedRowIndex !== null) {
          e.preventDefault();
          setFocusedRowIndex(null);
          searchInputRef?.current?.focus();
          return;
        }
      }

      // 9. Navigation from Product Search to Items Table (ArrowDown when empty)
      const isSearchFocused = document.activeElement === searchInputRef?.current;
      if (isSearchFocused && e.key === 'ArrowDown' && !isStepperOpen) {
        const searchVal = searchInputRef?.current?.value || '';
        if (searchVal.trim() === '' && itemsCount > 0) {
          e.preventDefault();
          searchInputRef?.current?.blur();
          setFocusedRowIndex(0);
          return;
        }
      }

      // 10. Table Row Navigation & Actions (When focusedRowIndex is active)
      if (focusedRowIndex !== null && !isStepperOpen && !isDrawerOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedRowIndex((prev) => (prev !== null && prev < itemsCount - 1 ? prev + 1 : prev));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (focusedRowIndex === 0) {
            setFocusedRowIndex(null);
            searchInputRef?.current?.focus();
          } else {
            setFocusedRowIndex((prev) => (prev !== null ? prev - 1 : 0));
          }
          return;
        }
        if (e.key === 'Enter' || e.key.toLowerCase() === 'e') {
          e.preventDefault();
          onEditRow?.(focusedRowIndex);
          return;
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          onDeleteRow?.(focusedRowIndex);
          if (itemsCount <= 1) {
            setFocusedRowIndex(null);
            searchInputRef?.current?.focus();
          } else if (focusedRowIndex >= itemsCount - 1) {
            setFocusedRowIndex(itemsCount - 2);
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isStepperOpen,
    isDrawerOpen,
    isModalOpen,
    itemsCount,
    focusedRowIndex,
    partyInputRef,
    searchInputRef,
    discountInputRef,
    freightInputRef,
    tableRef,
    onFocusParty,
    onFocusSearch,
    onFocusDiscount,
    onFocusFreight,
    onToggleDrawer,
    onParkBill,
    onRecallBillModal,
    onSubmit,
    onEditRow,
    onDeleteRow,
    onCloseStepper,
    onCloseDrawer,
    setFocusedRowIndex,
  ]);
};
