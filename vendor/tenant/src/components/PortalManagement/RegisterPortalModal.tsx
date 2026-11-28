import React from 'react';
import { useMediaQuery } from '@geeksman/core-ui';
import type { RegisterPortalFormState } from './PortalManagement.types';
import { RegisterPortalModalDesktop } from './RegisterPortalModal.desktop';
import { RegisterPortalModalMobile } from './RegisterPortalModal.mobile';

export interface RegisterPortalModalProps {
  isOpen: boolean;
  saving: boolean;
  form: RegisterPortalFormState;
  onFieldChange: <K extends keyof RegisterPortalFormState>(
    field: K,
    value: RegisterPortalFormState[K]
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const RegisterPortalModal: React.FC<RegisterPortalModalProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return isDesktop ? (
    <RegisterPortalModalDesktop {...props} />
  ) : (
    <RegisterPortalModalMobile {...props} />
  );
};
