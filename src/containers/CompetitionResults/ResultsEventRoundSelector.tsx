import classNames from 'classnames';
import { RoundResultStatus, RoundResultStatusBadge } from '@/components/RoundActionPicker';
import { LinkRenderer } from '@/lib/linkRenderer';

export interface ResultsEventRoundSelectorRound {
  id: string;
  roundNumber: number;
  href: string;
  resultStatus?: RoundResultStatus;
}

interface ResultsEventRoundSelectorProps {
  selectedRoundId: string;
  rounds: ResultsEventRoundSelectorRound[];
  LinkComponent: LinkRenderer;
}

export function ResultsEventRoundSelector({
  selectedRoundId,
  rounds,
  LinkComponent,
}: ResultsEventRoundSelectorProps) {
  if (rounds.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Event rounds" className="lg:hidden">
      <div className="flex w-full gap-2 overflow-x-auto pb-1">
        {rounds.map((round) => {
          const isSelected = round.id === selectedRoundId;

          return (
            <LinkComponent
              key={round.id}
              to={round.href}
              className={classNames(
                'flex min-h-11 min-w-20 flex-1 items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs leading-relaxed shadow-sm hover-transition active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:focus-visible:outline-blue-300 sm:min-h-12 sm:min-w-32 sm:justify-between sm:gap-2 sm:px-4 sm:py-3 sm:text-base',
                {
                  'border-blue-700 bg-blue-700 text-white shadow-md dark:border-blue-300 dark:bg-blue-300 dark:text-gray-950':
                    isSelected,
                  'border-gray-300 bg-panel text-default hover:border-blue-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-800':
                    !isSelected,
                },
              )}>
              <span className="whitespace-nowrap">{`Round ${round.roundNumber}`}</span>
              <RoundResultStatusBadge status={round.resultStatus} size="sm" />
            </LinkComponent>
          );
        })}
      </div>
    </nav>
  );
}
