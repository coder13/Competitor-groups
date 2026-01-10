import { Activity, AssignmentCode, Person } from '@wca/helpers';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CutoffTimeLimitPanel } from '@/components/CutoffTimeLimitPanel';
import { getRoomData, getRooms } from '@/lib/activities';
import { activityCodeToName, parseActivityCodeFlexible } from '@/lib/activityCodes';
import { getAllEvents, isOfficialEventId, isRankedBySingle } from '@/lib/events';
import { renderResultByEventId } from '@/lib/results';
import { formatDateTimeRange } from '@/lib/time';
import { useWCIF } from '@/providers/WCIFProvider';
import { niceActivityName } from './Activity';
import { PeopleList } from './PeopleList';

const isAssignment = (assignment) => (a) =>
  a.assignments.some(({ assignmentCode }) => assignmentCode === assignment);

interface EventGroupProps {
  competitionId: string;
  activity: Activity;
  persons: Person[];
}

export function EventActivity({ competitionId, activity, persons }: EventGroupProps) {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { setTitle, wcif } = useWCIF();
  const { eventId, roundNumber } = parseActivityCodeFlexible(activity?.activityCode || '');
  const event = useMemo(
    () => wcif && getAllEvents(wcif).find((e) => e.id === eventId),
    [eventId, wcif],
  );

  const round = useMemo(() => {
    if (!event) {
      return null;
    }

    return event.rounds?.find((r) => r.id === `${eventId}-r${roundNumber}`);
  }, [event, eventId, roundNumber]);

  const prevRound = useMemo(
    () => roundNumber && event?.rounds?.find((r) => r.id === `${eventId}-r${roundNumber - 1}`),
    [event?.rounds, eventId, roundNumber],
  );

  useEffect(() => {
    if (activity) {
      setTitle(niceActivityName(activity));
    }
  }, [activity, setTitle]);

  const room = useMemo(
    () =>
      wcif &&
      getRooms(wcif).find((r) =>
        r.activities.some(
          (a) => a.id === activity.id || a?.childActivities?.some((ca) => ca.id === activity.id),
        ),
      ),
    [activity.id, wcif],
  );

  const roomData = useMemo(() => {
    if (!room) {
      return undefined;
    }

    return getRoomData(room, activity);
  }, [activity, room]);

  const venue = wcif?.schedule.venues?.find((v) => v.rooms.some((r) => r.id === room?.id));
  const timeZone = venue?.timezone;

  const personsWithPRs = useMemo(
    () =>
      persons.map((person) => ({
        ...person,
        prSingle: person.personalBests?.find(
          (pb) => pb.eventId === eventId && pb.type === 'single',
        ),
        prAverage: person.personalBests?.find(
          (pb) => pb.eventId === eventId && pb.type === 'average',
        ),
      })),
    [persons, eventId],
  );

  const competitors = personsWithPRs.filter(isAssignment('competitor'));

  const assignments = new Set(
    personsWithPRs.map((person) => person.assignments?.map((a) => a.assignmentCode)).flat(),
  );

  const peopleByAssignmentCode = (Array.from(assignments.values()) as AssignmentCode[])
    .filter((assignmentCode) => assignmentCode !== 'competitor')
    .reduce((acc, assignmentCode) => {
      acc[assignmentCode] = personsWithPRs.filter(isAssignment(assignmentCode));
      return acc;
    }, {}) as Record<AssignmentCode, Person[]>;

  const seedResult = useCallback(
    (person) => {
      if (!isOfficialEventId(eventId)) {
        return '';
      }

      if (prevRound) {
        const prevRoundResults = prevRound.results?.find(
          (r) => r.personId?.toString() === person.registrantId?.toString(),
        );
        if (!prevRoundResults) {
          return '';
        }

        if (['a', 'm'].includes(prevRound.format)) {
          return renderResultByEventId(eventId, 'average', prevRoundResults.average);
        }

        return renderResultByEventId(eventId, 'single', prevRoundResults.best);
      }

      const averagePr = person.prAverage?.best;
      const singlePr = person.prSingle?.best;
      const shouldShowAveragePr = !isRankedBySingle(eventId);
      if ((shouldShowAveragePr && !averagePr) || !singlePr) {
        return '';
      }

      return renderResultByEventId(
        eventId,
        shouldShowAveragePr ? 'average' : 'single',
        shouldShowAveragePr ? averagePr : singlePr,
      );
    },
    [eventId, prevRound],
  );

  const seedRank = useCallback(
    (person) => {
      if (!isOfficialEventId(eventId)) {
        return '';
      }

      if (prevRound) {
        const prevRoundResults = prevRound.results?.find(
          (r) => r.personId?.toString() === person.registrantId?.toString(),
        );
        if (!prevRoundResults) {
          return '';
        }

        return prevRoundResults.ranking;
      }

      const averagePr = person.prAverage;
      const singlePr = person.prSingle;
      const shouldShowAveragePr = !isRankedBySingle(eventId);
      if ((shouldShowAveragePr && !averagePr) || !singlePr) {
        return '';
      }

      if (averagePr) {
        return averagePr.worldRanking;
      }

      return singlePr.worldRanking;
    },
    [eventId, prevRound],
  );

  const stationNumber = (assignmentCode) => (person) => {
    const assignment = person.assignments.find(
      (a) => a.assignmentCode === assignmentCode && a.activityId === activity.id,
    );
    return assignment?.stationNumber;
  };

  const anyCompetitorHasStationNumber = competitors.some(stationNumber('competitor'));

  const activityName = niceActivityName(activity);

  const groupNumber = parseActivityCodeFlexible(activity.activityCode).groupNumber;

  const allActivitiesInStage = useMemo(
    () =>
      room?.activities
        .flatMap((i) => i.childActivities)
        .filter((i) => {
          const stage = getRoomData(room, i);
          if (stage && roomData) {
            return stage?.name === roomData?.name;
          }

          return true;
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [room, roomData],
  );

  const currentIndex = useMemo(() => {
    return allActivitiesInStage?.findIndex((i) => i.id === activity.id);
  }, [activity.id, allActivitiesInStage]);

  const prev = useMemo(
    () =>
      allActivitiesInStage && currentIndex !== undefined
        ? allActivitiesInStage[currentIndex - 1]
        : undefined,
    [allActivitiesInStage, currentIndex],
  );
  const next = useMemo(
    () =>
      allActivitiesInStage && currentIndex !== undefined
        ? allActivitiesInStage[currentIndex + 1]
        : undefined,
    [allActivitiesInStage, currentIndex],
  );

  const prevUrl = prev && `/competitions/${competitionId}/activities/${prev?.id}`;
  const nextUrl = next && `/competitions/${competitionId}/activities/${next?.id}`;

  const goToPrev = useCallback(() => {
    if (prevUrl) {
      navigate(prevUrl);
    }
  }, [navigate, prevUrl]);

  const goToNext = useCallback(() => {
    if (nextUrl) {
      navigate(nextUrl);
    }
  }, [navigate, nextUrl]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrev();
      }

      if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [wcif, activity, goToPrev, goToNext]);

  console.log({ prev, next });

  return (
    <>
      {wcif && (
        <div className="p-2 space-y-2 text-sm text-gray-900 dark:text-white">
          <Breadcrumbs
            breadcrumbs={[
              {
                href: `/competitions/${wcif.id}/rooms/${room?.id}`,
                label: roomData?.name || '',
                pillProps: { style: { backgroundColor: `${roomData?.color}70` } },
              },
              ...(round
                ? [
                    {
                      href: `/competitions/${wcif.id}/events/${round.id}/${groupNumber}`,
                      label: activityName,
                    },
                  ]
                : [
                    {
                      label: activityName,
                    },
                  ]),
            ]}
          />
          <div className="flex space-x-2">
            <Link
              to={prevUrl || ''}
              className={classNames(
                'w-full border border-gray-200 dark:border-gray-700 rounded-md p-2 px-2 flex cursor-pointer transition-colors my-1 justify-end',
                {
                  'pointer-events-none opacity-25': !prev,
                  'hover:bg-slate-100 dark:hover:bg-gray-700 group cursor-pointer': prev,
                },
              )}>
              <span className="self-center mr-2 transition-all fa fa-arrow-left group-hover:-translate-x-2" />
              {t('competition.groups.previousGroup')}
            </Link>
            <Link
              to={nextUrl || ''}
              className={classNames(
                'w-full border border-gray-200 dark:border-gray-700 rounded-md p-2 px-2 flex cursor-pointer group hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors my-1',
                {
                  'pointer-events-none opacity-25': !next,
                  'hover:bg-slate-100 dark:hover:bg-gray-700 group': next,
                },
              )}>
              {t('competition.groups.nextGroup')}
              <span className="self-center ml-2 transition-all fa fa-arrow-right group-hover:translate-x-2" />
            </Link>
          </div>

          <div className="space-y-1">
            <span className="px-2">
              {formatDateTimeRange(activity.startTime, activity.endTime, 5, timeZone)}
            </span>
            {round && <CutoffTimeLimitPanel round={round} className="w-full" />}
          </div>
        </div>
      )}
      <hr className="mb-2 border-t border-gray-200 dark:border-gray-700" />
      {competitors.length > 0 && (
        <div>
          <h4 className="px-6 py-3 pb-1 text-lg font-bold text-center text-gray-900 bg-green-200 shadow-md dark:bg-green-900/60 dark:text-white">
            {t('common.assignments.competitor.noun')}{' '}
            <span className="text-sm">({competitors.length})</span>
          </h4>
          <table className="w-full text-left text-gray-900 dark:text-white">
            <thead>
              <tr className="text-xs bg-green-200 shadow-md lg:text-sm dark:bg-green-900/60 dark:shadow-gray-800/40">
                <th className="px-6 pt-1 pb-3">{t('common.name')}</th>
                <th className="px-6 pt-1 pb-3">{t('competition.eventActivity.seedResult')}</th>
                {anyCompetitorHasStationNumber && (
                  <th className="px-6 pt-1 pb-3">{t('competition.eventActivity.stationNumber')}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {competitors
                .map((person) => ({
                  ...person,
                  seedResult: seedResult(person),
                  seedRank: seedRank(person),
                }))
                .sort((a, b) => {
                  return (a.seedRank || 999999999) - (b.seedRank || 999999999);
                })
                .map((person) => (
                  <Link
                    key={person.registrantId}
                    className="table-row even:bg-green-50 dark:bg-gray-900 even:dark:bg-green-900/50 hover:brightness-150"
                    to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                    <td className="px-6 py-2.5">{person.name}</td>
                    <td className="px-6 py-2.5">{person.seedResult}</td>
                    {anyCompetitorHasStationNumber && (
                      <td className="px-6 py-2.5">{stationNumber('competitor')(person)}</td>
                    )}
                  </Link>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <PeopleList
        competitionId={competitionId}
        activity={activity}
        peopleByAssignmentCode={peopleByAssignmentCode}
      />
    </>
  );
}
