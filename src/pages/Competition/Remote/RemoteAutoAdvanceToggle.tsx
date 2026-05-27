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
        'relative inline-flex h-7 w-12 rounded-full border p-0.5 shadow-sm hover-transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'border-primary bg-primary hover:bg-primary-strong'
          : 'border-tertiary bg-tertiary hover:bg-tertiary-strong',
      )}
      onClick={onToggle}>
      <span
        className={classNames(
          'h-6 w-6 rounded-full border border-tertiary-weak bg-panel shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
