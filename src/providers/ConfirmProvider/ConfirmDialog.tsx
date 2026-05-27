import { ReactNode, useEffect } from 'react';
import { Button } from '@/components/Button';
import { ButtonVariant } from '@/components/Button';

export interface ConfirmDialogOptions {
  cancelLabel: string;
  confirmLabel: string;
  confirmVariant: ButtonVariant;
  message: ReactNode;
  title: string;
}

interface ConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  options: ConfirmDialogOptions;
}

export function ConfirmDialog({ onCancel, onConfirm, options }: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [onCancel]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog">
      <div className="w-full max-w-xl space-y-6 rounded-md bg-panel p-6 shadow-xl">
        <h2 className="type-heading">{options.title}</h2>

        <div className="type-body">{options.message}</div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="light" onClick={onCancel}>
            {options.cancelLabel}
          </Button>
          <Button type="button" variant={options.confirmVariant} onClick={onConfirm}>
            {options.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
