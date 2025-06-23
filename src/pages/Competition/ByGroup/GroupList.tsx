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
      <div className="p-2 space-y-2">
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
      <ul className="space-y-2 flex flex-col p-2">
        {[...uniqueGroupCodes.values()].map((value) => {
          const { groupNumber } = parseActivityCodeFlexible(value);
          const activities = groups.filter((g) => g.activityCode === value);
          const minStartTime = activities.map((a) => a.startTime).sort()[0];
          const maxEndTime = activities.map((a) => a.endTime).sort()[activities.length - 1];

          return (
            <Link
              to={`/competitions/${competitionId!}/events/${roundId}/${groupNumber}`}
              className=" border bg-white list-none rounded-md px-3 py-2 flex cursor-pointer hover:bg-blue-200 group transition-colors flex-row"
              key={value}>
              <li className="flex flex-col">
                <span className="text-lg">
                  {t('common.activityCodeToName.group', { groupNumber })}
                </span>
                <span className="text-xs">{formatDateTimeRange(minStartTime, maxEndTime)}</span>
              </li>
            </Link>
          );
        })}
      </ul>
      <div className="p-2">
        <Link
          to={`/competitions/${competitionId}/events/`}
          className="w-full border bg-blue-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-blue-400 group transition-colors my-1 flex-row">
          {t('competition.groups.backToEvents')}
        </Link>
      </div>
    </Container>
  );
}
