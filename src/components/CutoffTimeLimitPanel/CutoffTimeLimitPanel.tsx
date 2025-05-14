import { Cutoff, Round, parseActivityCode } from '@wca/helpers';
import classNames from 'classnames';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Popover } from 'react-tiny-popover';
import { renderCentiseconds, renderCutoff } from '@/lib/results';
import { useWCIF } from '@/providers/WCIFProvider';

export function CutoffTimeLimitPanel({
  round,
  className = '',
}: {
  round: Round;
  className?: string;
}) {
  const { t } = useTranslation();
  const { wcif } = useWCIF();

  const cutoff = round.cutoff;
  const timeLimit = round.timeLimit;
  const timelimitTime = timeLimit && renderCentiseconds(timeLimit?.centiseconds);

  if (!timeLimit && !cutoff && !round.advancementCondition) return null;

  const level = round.advancementCondition?.level;

  return (
    <div className={classNames('flex w-full', className)}>
      <div className="flex flex-col space-y-1 flex-1">
        <div className="divide-x-2 divide-gray-100">
          {cutoff && (
            <span className="px-2">
              {t('common.wca.cutoff')}:{' '}
              <span className="font-semibold">{renderCutoff(cutoff)}</span>
            </span>
          )}

          {timeLimit && !timeLimit?.cumulativeRoundIds.length && (
            <span className="px-2">
              {t('common.wca.timeLimit')}: <span className="font-semibold">{timelimitTime}</span>
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
                          {t('common.activityCodeToName.round', { roundNumber })}
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
                <Trans
                  i18nKey={'common.wca.advancement.ranking'}
                  values={{ level }}
                  components={{ b: <span className="font-semibold" /> }}
                />
              </div>
            )}
            {round.advancementCondition.type === 'percent' && (
              <div className="px-2">
                <Trans
                  i18nKey={'common.wca.advancement.percent'}
                  values={{ level }}
                  components={{ b: <span className="font-semibold" /> }}
                />
              </div>
            )}
            {round.advancementCondition.type === 'attemptResult' && (
              <div className="px-2">
                <Trans
                  i18nKey={'common.wca.advancement.attemptResult'}
                  values={{ level }}
                  components={{ b: <span className="font-semibold" /> }}
                />
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
  const { t } = useTranslation();
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
            },
          )}>
          <p>
            <Trans
              i18nKey="common.cutoffTimeLimitPopover.timeLimits"
              components={{ b: <strong /> }}
            />
          </p>

          <p>
            <Trans i18nKey="common.cutoffTimeLimitPopover.cutoffs" components={{ b: <strong /> }} />
            <br />
            <i>
              {cutoff &&
                t('common.cutoffTimeLimitPopover.cutoff', { count: cutoff.numberOfAttempts })}
            </i>
          </p>

          <p>
            <Trans i18nKey="common.cutoffTimeLimitPopover.advancement" />
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
