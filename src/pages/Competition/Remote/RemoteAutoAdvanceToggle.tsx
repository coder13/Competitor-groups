import classNames from 'classnames';

interface RemoteAutoAdvanceToggleProps {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function RemoteAutoAdvanceToggle({
  checked,
  disabled,
  onToggle,
}: RemoteAutoAdvanceToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Auto-advance"
      disabled={disabled}
      className={classNames(
        'relative h-6 w-12 rounded-full shadow-sm hover-transition disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-blue-300' : 'bg-gray-300 dark:bg-gray-600',
      )}
      onClick={onToggle}>
      <span
        className={classNames(
          'absolute left-0 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-blue-600 shadow-md transition-transform',
          checked ? 'translate-x-6' : 'translate-x-0 bg-gray-50 dark:bg-gray-300',
        )}
      />
    </button>
  );
}
