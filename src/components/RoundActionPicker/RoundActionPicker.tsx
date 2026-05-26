import classNames from 'classnames';
import { AnchorLink } from '@/lib/linkRenderer';
import { RoundActionPickerEvent, RoundActionPickerMode, RoundActionPickerProps } from './types';

export type RoundResultStatus = RoundActionPickerEvent['rounds'][number]['resultStatus'];

const modeConfig: Record<
  RoundActionPickerMode,
  {
    actionLabel: string;
  }
> = {
  groups: {
    actionLabel: 'Choose group',
  },
  results: {
    actionLabel: 'View results',
  },
};

const resultStatusLabel: Record<
  NonNullable<RoundActionPickerEvent['rounds'][number]['resultStatus']>,
  string
> = {
  now: 'Now',
  done: 'Done',
};

const resultStatusClassName: Record<
  NonNullable<RoundActionPickerEvent['rounds'][number]['resultStatus']>,
  string
> = {
  now: 'bg-amber-100 text-amber-900 ring-amber-300 dark:bg-amber-900 dark:text-amber-100 dark:ring-amber-700',
  done: 'bg-blue-100 text-blue-900 ring-blue-300 dark:bg-blue-900 dark:text-blue-100 dark:ring-blue-700',
};

function EventIcon({ eventId }: { eventId: string }) {
  return <span className={`cubing-icon event-${eventId}`} aria-hidden="true" />;
}

export function RoundResultStatusBadge({
  status,
  size = 'default',
}: {
  status: RoundResultStatus;
  size?: 'default' | 'sm';
}) {
  if (!status) {
    return <span aria-hidden="true" />;
  }

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-md ring-1 ring-inset',
        size === 'sm' ? 'px-1.5 py-0.5 text-[0.65rem]' : 'px-2 py-1 type-body-xs',
        resultStatusClassName[status],
      )}>
      {resultStatusLabel[status]}
    </span>
  );
}

function RoundMetric({
  mode,
  groupCount,
  resultStatus,
}: {
  mode: RoundActionPickerMode;
  groupCount?: number;
  resultStatus?: RoundActionPickerEvent['rounds'][number]['resultStatus'];
}) {
  if (mode === 'groups') {
    return (
      <span className="inline-flex min-w-10 items-center justify-end tabular-nums">
        {groupCount ?? 0}
      </span>
    );
  }

  return <RoundResultStatusBadge status={resultStatus} size="sm" />;
}

export function RoundActionPicker({
  mode,
  events,
  LinkComponent = AnchorLink,
}: RoundActionPickerProps) {
  const config = modeConfig[mode];

  return (
    <section className="w-full type-body">
      <div className="overflow-hidden rounded-md border border-tertiary-weak bg-panel shadow-sm">
        {events.map((event) => (
          <div key={event.id} className="border-t border-tertiary-weak first:border-t-0">
            {event.rounds.map((round, roundIndex) => (
              <LinkComponent
                key={round.id}
                to={round.href ?? '#'}
                className="grid min-h-12 grid-cols-[minmax(10rem,24rem)_7rem_minmax(0,1fr)_8rem] items-center gap-2 px-3 py-2 text-default hover-transition hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="flex min-w-0 items-center gap-2">
                  {roundIndex === 0 && (
                    <>
                      <EventIcon eventId={event.id} />
                      <span className="truncate">{event.name}</span>
                    </>
                  )}
                </span>
                <span>{`Round ${round.roundNumber}`}</span>
                <span aria-hidden="true" />
                <span className="flex items-center justify-end gap-2">
                  <RoundMetric
                    mode={mode}
                    groupCount={round.groupCount}
                    resultStatus={round.resultStatus}
                  />
                  <span className="sr-only">{config.actionLabel}</span>
                  <span className="fa fa-chevron-right text-muted" aria-hidden="true" />
                </span>
              </LinkComponent>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
