import { PropsWithChildren, useCallback, useRef, useState } from 'react';
import { ConfirmContext, ConfirmOptions } from './ConfirmContext';
import { ConfirmDialog, ConfirmDialogOptions } from './ConfirmDialog';

interface PendingConfirm extends ConfirmDialogOptions {
  resolve: (confirmed: boolean) => void;
}

const normalizeOptions = (options: ConfirmOptions | string): ConfirmOptions =>
  typeof options === 'string' ? { message: options } : options;

export function ConfirmProvider({ children }: PropsWithChildren) {
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const pendingConfirmRef = useRef<PendingConfirm | null>(null);
  const confirmQueueRef = useRef<PendingConfirm[]>([]);

  const confirm = useCallback((rawOptions: ConfirmOptions | string) => {
    const options = normalizeOptions(rawOptions);

    return new Promise<boolean>((resolve) => {
      const nextConfirm = {
        cancelLabel: options.cancelLabel || 'Cancel',
        confirmLabel: options.confirmLabel || 'Confirm',
        confirmVariant: options.confirmVariant || 'blue',
        message: options.message,
        resolve,
        title: options.title || 'Are you sure?',
      };

      if (pendingConfirmRef.current) {
        confirmQueueRef.current.push(nextConfirm);
        return;
      }

      pendingConfirmRef.current = nextConfirm;
      setPendingConfirm(nextConfirm);
    });
  }, []);

  const close = (confirmed: boolean) => {
    const currentConfirm = pendingConfirmRef.current;
    if (!currentConfirm) {
      return;
    }

    currentConfirm.resolve(confirmed);

    const nextConfirm = confirmQueueRef.current.shift() || null;
    pendingConfirmRef.current = nextConfirm;
    setPendingConfirm(nextConfirm);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {pendingConfirm && (
        <ConfirmDialog
          options={pendingConfirm}
          onCancel={() => close(false)}
          onConfirm={() => close(true)}
        />
      )}
    </ConfirmContext.Provider>
  );
}
