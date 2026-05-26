import classNames from 'classnames';
import { NoteBox } from '@/components/Notebox';
import { useNotifyCompWebSocketStatus } from '@/hooks/useNotifyCompWebSocketStatus';

interface NotifyCompConnectionStatusProps {
  className?: string;
  compact?: boolean;
}

const statusText = {
  connecting: 'Connecting to NotifyComp live updates...',
  disconnected:
    'Not connected to NotifyComp live updates. Activity changes may not update automatically.',
  idle: '',
  connected: '',
};

export function NotifyCompConnectionStatus({
  className,
  compact = false,
}: NotifyCompConnectionStatusProps) {
  const { message, status } = useNotifyCompWebSocketStatus();

  if (status === 'idle' || status === 'connected') {
    return null;
  }

  const text = message || statusText[status];
  const toneClassName =
    status === 'connecting' ? 'bg-yellow-400 dark:bg-yellow-300' : 'bg-red-500 dark:bg-red-400';

  if (compact) {
    return (
      <div
        className={classNames(
          'flex items-center justify-center gap-1 text-xs font-medium text-muted',
          className,
        )}
        title={text}>
        <span className={classNames('h-2 w-2 rounded-full', toneClassName)} aria-hidden="true" />
        <span>{status === 'connecting' ? 'Connecting live updates' : 'Live updates offline'}</span>
      </div>
    );
  }

  return <NoteBox className={className} prefix="Live updates" text={text} />;
}
