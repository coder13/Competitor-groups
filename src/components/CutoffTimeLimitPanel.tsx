import { Round, parseActivityCode } from '@wca/helpers';
import { renderCentiseconds, renderCutoff } from '../lib/utils';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { useWCIF } from '../pages/Competition/WCIFProvider';

export function CutoffTimeLimitPanel({
  round,
  className = '',
}: {
  round: Round;
  className?: string;
}) {
  const { wcif } = useWCIF();

  const cutoff = round.cutoff;
  const timeLimit = round.timeLimit;
  const timelimitTime = timeLimit && renderCentiseconds(timeLimit?.centiseconds);

  return (
    <>
      <div className={classNames('divide-x-2 divide-gray-100', className)}>
        {cutoff && (
          <span className="p-2">
            Cutoff: <span className="font-semibold">{renderCutoff(cutoff)}</span>
          </span>
        )}

        {timeLimit && !timeLimit?.cumulativeRoundIds.length && (
          <span className="p-2">
            Timelimit: <span className="font-semibold">{timelimitTime}</span>
          </span>
        )}

        {timeLimit && timeLimit?.cumulativeRoundIds.length > 0 && (
          <div className="p-2">
            Time limit: {timelimitTime} with{' '}
            <span>
              {timeLimit.cumulativeRoundIds
                .filter((activityCode) => activityCode !== round.id)
                .map((activityCode, i, arry) => {
                  const { eventId, roundNumber } = parseActivityCode(activityCode);
                  return (
                    <Link
                      key={activityCode}
                      to={`/competitions/${wcif?.id}/events/${activityCode}`}>
                      <span
                        className={`cubing-icon event-${eventId} mx-1 before:-ml-1 before:mr-2`}>
                        Round {roundNumber}
                        {i < arry.length - 1 ? ', ' : ''}
                      </span>
                    </Link>
                  );
                })}
            </span>
          </div>
        )}
      </div>
      {round.advancementCondition && (
        <div className={className}>
          <div className={'p-2'}>
            Top <span className="font-semibold">{round.advancementCondition.level}</span> advance to
            next round
          </div>
        </div>
      )}
    </>
  );
}
