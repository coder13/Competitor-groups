import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { Container } from '@/components/Container';
import { CutoffTimeLimitPanel } from '@/components/CutoffTimeLimitPanel';
import {
  activityCodeToName,
  parseActivityCodeFlexible,
  toRoundAttemptId,
} from '@/lib/activityCodes';
import { getAllEvents } from '@/lib/events';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { formatDateTimeRange } from '@/lib/time';
import { useWCIF, useWcifUtils } from '@/providers/WCIFProvider';

export interface CompetitionRoundContainerProps {
  competitionId: string;
  roundId: string;
  LinkComponent?: LinkRenderer;
}

export function CompetitionRoundContainer({
  competitionId,
  roundId,
  LinkComponent = AnchorLink,
}: CompetitionRoundContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();
  const { roundActivies } = useWcifUtils();

  useEffect(() => {
    setTitle(activityCodeToName(roundId));
  }, [roundId, setTitle]);

  const round = useMemo(() => {
    const events = wcif && getAllEvents(wcif);
    return events?.flatMap((e) => e.rounds).find((r) => r.id === roundId);
  }, [roundId, wcif]);

  const rounds = roundActivies.filter((ra) => toRoundAttemptId(ra.activityCode) === roundId);
  const groups = rounds.flatMap((r) => r.childActivities);
  const uniqueGroupCodes = [...new Set(groups.map((g) => g.activityCode))];

  return (
    <Container>
      <div className="space-y-2 p-2 type-body">
        <Breadcrumbs
          LinkComponent={LinkComponent}
          breadcrumbs={[
            {
              label: activityCodeToName(roundId) || t('competition.groups.allGroups'),
            },
          ]}
        />
        <div className="flex flex-col space-y-1">
          {round && <CutoffTimeLimitPanel round={round} />}
        </div>
      </div>
      <ul className="flex flex-col space-y-2 p-2">
        {uniqueGroupCodes.map((value) => {
          const { groupNumber } = parseActivityCodeFlexible(value);
          const activities = groups.filter((g) => g.activityCode === value);
          const minStartTime = activities.map((a) => a.startTime).sort()[0];
          const maxEndTime = activities.map((a) => a.endTime).sort()[activities.length - 1];

          return (
            <LinkComponent
              key={value}
              to={`/competitions/${competitionId}/events/${roundId}/${groupNumber}`}
              className="flex flex-row list-none rounded-md border border-tertiary bg-tertiary px-3 py-2 transition-colors hover:bg-tertiary-strong group dark:text-white">
              <li className="flex flex-col">
                <span className="type-heading">
                  {t('common.activityCodeToName.group', { groupNumber })}
                </span>
                <span className="type-meta">{formatDateTimeRange(minStartTime, maxEndTime)}</span>
              </li>
            </LinkComponent>
          );
        })}
      </ul>
      <div className="p-2">
        <LinkComponent
          to={`/competitions/${competitionId}/events/`}
          className="my-1 flex w-full flex-row rounded-md border border-primary bg-primary p-2 px-1 transition-colors hover:bg-primary-strong group dark:text-gray-100">
          {t('competition.groups.backToEvents')}
        </LinkComponent>
      </div>
    </Container>
  );
}
