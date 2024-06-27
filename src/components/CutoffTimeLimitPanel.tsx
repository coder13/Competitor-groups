import { Cutoff, Round, parseActivityCode } from '@wca/helpers';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Popover } from 'react-tiny-popover';
import { renderCentiseconds, renderCutoff } from '../lib/utils';
import { useWCIF } from '../providers/WCIFProvider';
import { useState } from 'react';

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

  if (!timeLimit && !cutoff && !round.advancementCondition) return null;

  return (
    <div className={classNames('flex w-full', className)}>
      <div className="flex flex-col space-y-1 flex-1">
        <div className="divide-x-2 divide-gray-100">
          {cutoff && (
            <span className="px-2">
              Cutoff: <span className="font-semibold">{renderCutoff(cutoff)}</span>
            </span>
          )}

          {timeLimit && !timeLimit?.cumulativeRoundIds.length && (
            <span className="px-2">
              Timelimit: <span className="font-semibold">{timelimitTime}</span>
            </span>
          )}

          {timeLimit && timeLimit?.cumulativeRoundIds.length > 0 && (
            <div className="px-2">
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
          <div>
            {round.advancementCondition.type === 'ranking' && (
              <div className="px-2">
                Top <span className="font-semibold">{round.advancementCondition.level}</span>{' '}
                advance to next round
              </div>
            )}
            {round.advancementCondition.type === 'percent' && (
              <div className="px-2">
                Top <span className="font-semibold">{round.advancementCondition.level}%</span>{' '}
                advance to next round
              </div>
            )}
            {round.advancementCondition.type === 'attemptResult' && (
              <div className="px-2">
                Result better than{' '}
                <span className="font-semibold">{round.advancementCondition.level}</span> advances
                to next round. Minimum of 25% of competitors must be eliminated.
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <CutoffTimeLimitPopover cutoff={round.cutoff} />
      </div>
    </div>
  );
}

function CutoffTimeLimitPopover({ cutoff }: { cutoff: Cutoff | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      isOpen={open}
      positions={['bottom']} // preferred positions by priority
      onClickOutside={() => setOpen(false)} // handle click events outside of the popover/target here!
      padding={10}
      content={
        <div
          className={classNames(
            'z-1000 max-w-xs md:max-w-md lg:max-w-lg text-sm  transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-md opacity-0 p-4 space-y-2',
            {
              'opacity-100': open,
            }
          )}>
          <p>
            <b>Time limits</b> are established for all rounds, applying to each individual solve.
            Solves that exceed the limit will be marked as "DNF" and the time will not count.
          </p>

          <p>
            Each round may include <b>cutoffs</b>, which dictate whether a competitor is eligible to
            complete all their attempts to finish their average. To qualify, they must achieve a
            time within the cutoff time during their initial solve or within their first two solves.
            <br />
            <i>
              {cutoff &&
                `This round requires the condition met in the first ${
                  cutoff.numberOfAttempts
                } attempt${cutoff.numberOfAttempts > 1 ? 's' : ''}`}
            </i>
          </p>

          <p>
            At least 25% of competitors must be eliminated before progressing to the next round. The
            organizing team will establish advancement criteria for each round, but adjustments may
            be necessary to ensure this minimum elimination threshold is met.
          </p>
        </div>
      }>
      <button
        className="mr-2 px-1"
        // className="fa-solid fa-question p-2 bg-slate-300 rounded-full px-3 shadow-sm hover:opacity-70 text-sm"
        onClick={() => setOpen((prev) => !prev)}>
        <svg
          className="w-7 h-7 ms-2 text-gray-400 hover:text-gray-500"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"></path>
        </svg>
      </button>
    </Popover>
  );
}
