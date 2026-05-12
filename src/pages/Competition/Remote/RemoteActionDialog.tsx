import { Button } from '@/components';

export type RemoteAction = 'start' | 'stop';

interface RemoteActionDialogProps {
  action: RemoteAction;
  activityName: string;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  roomNames: string[];
}

export function RemoteActionDialog({
  action,
  activityName,
  disabled,
  onCancel,
  onConfirm,
  roomNames,
}: RemoteActionDialogProps) {
  const actionLabel = action === 'start' ? 'Start' : 'Stop';

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog">
      <div className="w-full max-w-3xl space-y-8 rounded-md bg-panel p-8 shadow-xl">
        <h2 className="type-heading">Are you sure?</h2>

        <p className="type-body">
          This will {action} activity: <strong>{activityName}</strong> in rooms:{' '}
          {roomNames.join(', ')}
        </p>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="light" disabled={disabled} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={action === 'start' ? 'green' : 'gray'}
            disabled={disabled}
            onClick={onConfirm}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
