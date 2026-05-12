import { createContext, ReactNode, useContext } from 'react';
import { ButtonVariant } from '@/components/Button';

export interface ConfirmOptions {
  cancelLabel?: string;
  confirmLabel?: string;
  confirmVariant?: ButtonVariant;
  message: ReactNode;
  title?: string;
}

export type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn>(async () => false);

export const useConfirm = () => useContext(ConfirmContext);
