import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { Container } from '@/components/Container';
import { CutoffTimeLimitPanel } from '@/components/CutoffTimeLimitPanel';
import {
  activityCodeToName,
  parseActivityCodeFlexible,
  toRoundAttemptId,
} from '@/lib/activityCodes';
import { getAllEvents } from '@/lib/events';
import { formatDateTimeRange } from '@/lib/time';
import { useWCIF, useWcifUtils } from '@/providers/WCIFProvider';

export default function GroupList() {
  const { t } = useTranslation();

  const { wcif, setTitle } = useWCIF();
  const { competitionId, roundId } = useParams();
  const { roundActivies } = useWcifUtils();

  useEffect(() => {
    if (!roundId) {
      return;
    }

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
    <Container className="">
      <div className="p-2 space-y-2 type-body">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: roundId ? activityCodeToName(roundId) : t('competition.groups.allGroups'),
            },
          ]}
        />
        <div className="flex flex-col space-y-1">
          {round && <CutoffTimeLimitPanel round={round} className="" />}
        </div>
      </div>
      <ul className="flex flex-col p-2 space-y-2">
        {[...uniqueGroupCodes.values()].map((value) => {
          const { groupNumber } = parseActivityCodeFlexible(value);
          const activities = groups.filter((g) => g.activityCode === value);
          const minStartTime = activities.map((a) => a.startTime).sort()[0];
          const maxEndTime = activities.map((a) => a.endTime).sort()[activities.length - 1];

          return (
            <Link
              to={`/competitions/${competitionId!}/events/${roundId}/${groupNumber}`}
              className="flex flex-row px-3 py-2 list-none transition-colors border rounded-md cursor-pointer border-tertiary bg-tertiary hover:bg-tertiary-strong group dark:text-white"
              key={value}>
              <li className="flex flex-col">
                <span className="type-heading">
                  {t('common.activityCodeToName.group', { groupNumber })}
                </span>
                <span className="type-meta">{formatDateTimeRange(minStartTime, maxEndTime)}</span>
              </li>
            </Link>
          );
        })}
      </ul>
      <div className="p-2">
        <Link
          to={`/competitions/${competitionId}/events/`}
          className="flex flex-row w-full p-2 px-1 my-1 transition-colors border rounded-md cursor-pointer border-primary bg-primary hover:bg-primary-strong group dark:text-gray-100">
          {t('competition.groups.backToEvents')}
        </Link>
      </div>
    </Container>
  );
}
