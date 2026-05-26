import { Cutoff, Round, parseActivityCode } from '@wca/helpers';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Popover } from 'react-tiny-popover';
import { renderCentiseconds, renderCutoff } from '@/lib/results';
import { getEventRoundsForRound, joinLabels } from '@/lib/roundLabels';
import { CompatibleRound, getAdvancementConditionForRound, ResultCondition } from '@/lib/wcif';
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
  const cumulativeRoundIds = getCumulativeRoundIds(timeLimit, round.id);
  const eventRounds = useMemo(
    () => getEventRoundsForRound(wcif?.events, round.id),
    [round.id, wcif?.events],
  );
  const advancement = useMemo(
    () => getAdvancementConditionForRound(eventRounds, round as CompatibleRound),
    [eventRounds, round],
  );

  if (!timeLimit && !cutoff && !advancement) return null;

  return (
    <div className={classNames('flex w-full', className)}>
      <div className="flex flex-col flex-1 -mx-2 space-y-1">
        <div className="flex divide-x-2 divide-tertiary-weak">
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

          {timeLimit &&
            timeLimit?.cumulativeRoundIds.length > 0 &&
            cumulativeRoundIds.length === 0 && (
              <span className="px-2">
                <Trans
                  i18nKey={'common.wca.cumulativeTimelimit'}
                  values={{ time: timelimitTime }}
                  components={{ b: <span className="font-semibold" /> }}
                />
              </span>
            )}

          {timeLimit &&
            timeLimit?.cumulativeRoundIds.length > 0 &&
            cumulativeRoundIds.length > 0 && (
              <div className="px-2">
                <span>
                  <Trans
                    i18nKey={'common.wca.cumulativeTimelimitWithrounds'}
                    values={{ time: timelimitTime }}
                    components={{ b: <span className="font-semibold" /> }}
                  />
                  {cumulativeRoundIds.map((activityCode, i, arry) => {
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
        {advancement && (
          <div className="px-2">
            {renderAdvancementText(t, eventRounds, advancement.sourceType, advancement)}
          </div>
        )}
      </div>
      <div>
        <CutoffTimeLimitPopover cutoff={round.cutoff} />
      </div>
    </div>
  );
}

function getCumulativeRoundIds(timeLimit: Round['timeLimit'], roundId: string) {
  return timeLimit?.cumulativeRoundIds.filter((activityCode) => activityCode !== roundId) || [];
}

function renderAdvancementText(
  t: ReturnType<typeof useTranslation>['t'],
  eventRounds: CompatibleRound[],
  sourceType: 'registrations' | 'round' | 'linkedRounds',
  advancement: NonNullable<ReturnType<typeof getAdvancementConditionForRound>>,
) {
  if (sourceType === 'linkedRounds') {
    return renderLinkedRoundsAdvancementText(t, eventRounds, advancement);
  }

  return renderSingleRoundAdvancementText(t, eventRounds, advancement);
}

function renderLinkedRoundsAdvancementText(
  t: ReturnType<typeof useTranslation>['t'],
  eventRounds: CompatibleRound[],
  advancement: NonNullable<ReturnType<typeof getAdvancementConditionForRound>>,
) {
  const { resultCondition } = advancement;
  const sourceRoundNames = advancement.sourceRoundIds.map((roundId) => {
    const roundNumber = parseActivityCode(roundId).roundNumber;
    return roundNumber ? roundNumber.toString() : '';
  });
  const sourceRoundsLabel = joinLabels(sourceRoundNames);
  const targetLabel = getAdvancementTargetLabel(t, eventRounds, advancement.targetRoundId);

  switch (resultCondition.type) {
    case 'ranking':
      return t('common.wca.advancement.linkedRanking', {
        level: resultCondition.value,
        rounds: sourceRoundsLabel,
        what: targetLabel,
      });
    case 'percent':
      return t('common.wca.advancement.linkedPercent', {
        level: resultCondition.value,
        rounds: sourceRoundsLabel,
        what: targetLabel,
      });
    case 'resultAchieved':
      return t('common.wca.advancement.linkedResultAchieved', {
        scope: t(`common.wca.advancement.scope.${resultCondition.scope}`),
        result:
          resultCondition.value === null
            ? t('common.wca.advancement.resultThresholdUnknown')
            : renderCentiseconds(resultCondition.value),
        rounds: sourceRoundsLabel,
        what: targetLabel,
      });
  }
}

function renderSingleRoundAdvancementText(
  t: ReturnType<typeof useTranslation>['t'],
  eventRounds: CompatibleRound[],
  advancement: NonNullable<ReturnType<typeof getAdvancementConditionForRound>>,
) {
  const { resultCondition } = advancement;
  const targetLabel = getAdvancementTargetLabel(t, eventRounds, advancement.targetRoundId);

  switch (resultCondition.type) {
    case 'ranking':
      return t('common.wca.advancement.ranking', {
        level: resultCondition.value,
        what: targetLabel,
      });
    case 'percent':
      return t('common.wca.advancement.percent', {
        level: resultCondition.value,
        what: targetLabel,
      });
    case 'resultAchieved':
      return t('common.wca.advancement.resultAchieved', {
        scope: t(`common.wca.advancement.scope.${resultCondition.scope}`),
        result:
          resultCondition.value === null
            ? t('common.wca.advancement.resultThresholdUnknown')
            : renderCentiseconds(resultCondition.value),
        what: targetLabel,
      });
  }
}

function getAdvancementTargetLabel(
  t: ReturnType<typeof useTranslation>['t'],
  eventRounds: CompatibleRound[],
  targetRoundId: string | null | undefined,
) {
  if (!targetRoundId) {
    return t('common.wca.advancement.unknown');
  }

  const targetRoundIndex = eventRounds.findIndex((candidate) => candidate.id === targetRoundId);
  if (targetRoundIndex === eventRounds.length - 1) {
    return t('common.wca.advancement.final');
  }

  return t('common.wca.advancement.nextRound');
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
            'z-1000 max-w-xs p-4 space-y-2 transition-opacity duration-300 border rounded-lg shadow-md md:max-w-md lg:max-w-lg type-body-sm bg-panel text-default border-tertiary-weak opacity-0',
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
        className="px-1 mr-2"
        aria-label={t('common.help')}
        // className="p-2 px-3 text-sm rounded-full shadow-sm fa-solid fa-question bg-slate-300 hover:opacity-70"
        onClick={() => setOpen((prev) => !prev)}>
        <svg
          className="text-muted w-7 h-7 ms-2 hover-text-muted"
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
