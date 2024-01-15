import { Activity, AssignmentCode, Person } from '@wca/helpers';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { activityCodeToName, parseActivityCode, rooms } from '../../../lib/activities';
import {
  byName,
  formatDate,
  formatDateRange,
  formatDateTimeRange,
  formatTimeRange,
  renderResultByEventId,
} from '../../../lib/utils';
import { useWCIF } from '../WCIFProvider';
import { isRankedBySingle } from '../../../lib/events';
import { AssignmentCodeRank, AssignmentCodeTitles } from '../../../lib/assignments';
import { CutoffTimeLimitPanel } from '../../../components/CutoffTimeLimitPanel';

const isAssignment = (assignment) => (a) =>
  a.assignments.some(({ assignmentCode }) => assignmentCode === assignment);

interface EventGroupProps {
  competitionId: string;
  activity: Activity;
  persons: Person[];
}

export default function EventGroup({ competitionId, activity, persons }: EventGroupProps) {
  const { setTitle, wcif } = useWCIF();
  const { eventId, roundNumber } = parseActivityCode(activity?.activityCode || '');
  const event = useMemo(() => wcif?.events.find((e) => e.id === eventId), [eventId, wcif?.events]);

  const round = useMemo(() => {
    if (!event) {
      return null;
    }

    return event.rounds?.find((r) => r.id === `${eventId}-r${roundNumber}`);
  }, [event, eventId, roundNumber]);

  const prevRound = useMemo(
    () => roundNumber && event?.rounds?.find((r) => r.id === `${eventId}-r${roundNumber - 1}`),
    [event?.rounds, eventId, roundNumber]
  );

  useEffect(() => {
    if (activity) {
      setTitle(activityCodeToName(activity.activityCode));
    }
  }, [activity, setTitle]);

  const room = useMemo(
    () =>
      wcif &&
      rooms(wcif).find((r) =>
        r.activities.some(
          (a) => a.id === activity.id || a?.childActivities?.some((ca) => ca.id === activity.id)
        )
      ),
    [activity.id, wcif]
  );

  const venue = wcif?.schedule.venues?.find((v) => v.rooms.some((r) => r.id === room?.id));
  const timeZone = venue?.timezone;

  const everyoneInActivity = useMemo(
    () =>
      persons.map((person) => ({
        ...person,
        prSingle: person.personalBests?.find(
          (pb) => pb.eventId === eventId && pb.type === 'single'
        ),
        prAverage: person.personalBests?.find(
          (pb) => pb.eventId === eventId && pb.type === 'average'
        ),
      })),
    [persons, eventId]
  );

  const competitors = everyoneInActivity.filter(isAssignment('competitor'));

  const assignments = new Set(
    everyoneInActivity.map((person) => person.assignments?.map((a) => a.assignmentCode)).flat()
  );

  const peopleByAssignmentCode = (Array.from(assignments.values()) as AssignmentCode[])
    .filter((assignmentCode) => assignmentCode !== 'competitor')
    .reduce((acc, assignmentCode) => {
      acc[assignmentCode] = everyoneInActivity.filter(isAssignment(assignmentCode));
      return acc;
    }, {}) as Record<AssignmentCode, Person[]>;

  const seedResult = useCallback(
    (person) => {
      if (prevRound) {
        const prevRoundResults = prevRound.results?.find(
          (r) => r.personId?.toString() === person.registrantId?.toString()
        );
        if (!prevRoundResults) {
          return '';
        }

        if (['a' || 'm'].includes(prevRound.format)) {
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
        shouldShowAveragePr ? averagePr : singlePr
      );
    },
    [eventId, prevRound]
  );

  const seedRank = useCallback(
    (person) => {
      if (prevRound) {
        const prevRoundResults = prevRound.results?.find(
          (r) => r.personId?.toString() === person.registrantId?.toString()
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
    [eventId, prevRound]
  );

  const stationNumber = (assignmentCode) => (person) => {
    const assignment = person.assignments.find(
      (a) => a.assignmentCode === assignmentCode && a.activityId === activity.id
    );
    return assignment?.stationNumber;
  };

  const anyCompetitorHasStationNumber = competitors.some(stationNumber('competitor'));

  const activityName = activityCodeToName(activity.activityCode);
  const activityNameSplit = activityName.split(', ');
  const roundName = activityNameSplit.slice(0, 2).join(', ');
  const groupName = activityNameSplit.slice(-1);

  return (
    <>
      {wcif && (
        <div className="p-2 space-y-2">
          <h3 className="font-bold" style={{ lineHeight: 2 }}>
            <Link
              className="px-3 py-2 rounded mr-2 hover:underline"
              style={{
                backgroundColor: `${room?.color}70`,
              }}
              to={`/competitions/${wcif.id}/rooms/${room?.id}`}>
              {room?.name}
            </Link>
            <Link to={`/competitions/${wcif.id}/events/${round?.id}`} className="hover:underline">
              {roundName}
            </Link>
            {', '}
            <span>{groupName}</span>
          </h3>
          <div className="space-y-1">
            <span className="px-2">
              {formatDateTimeRange(activity.startTime, activity.endTime, 5, timeZone)}
            </span>
            {round && (
              <div className="space-y-1 p-2">
                <CutoffTimeLimitPanel round={round} className="-m-2" />
              </div>
            )}
          </div>
        </div>
      )}
      <hr className="mb-2" />
      <div>
        <h4 className="bg-green-200 pb-1 text-lg font-bold text-center shadow-md py-3 px-6">
          Competitors
        </h4>
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs lg:text-sm bg-green-200 shadow-md">
              <th className="pt-1 pb-3 px-6">Name</th>
              <th className="pt-1 pb-3 px-6">Seed Result</th>
              {anyCompetitorHasStationNumber && <th className="pt-1 pb-3 px-6">Station Number</th>}
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
                  className="table-row even:bg-green-50 hover:opacity-80"
                  to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                  <td className="py-3 px-6">{person.name}</td>
                  <td className="py-3 px-6">{person.seedResult}</td>
                  {anyCompetitorHasStationNumber && (
                    <td className="py-3 px-6">{stationNumber('competitor')(person)}</td>
                  )}
                </Link>
              ))}
          </tbody>
        </table>
      </div>
      {Object.keys(peopleByAssignmentCode)
        .sort((a, b) => AssignmentCodeRank.indexOf(a) - AssignmentCodeRank.indexOf(b))
        .map((assignmentCode) => {
          const people = peopleByAssignmentCode[assignmentCode];

          const anyHasStationNumber = people.some(stationNumber(assignmentCode));

          const headerColorClassName = {
            'bg-yellow-100': assignmentCode === 'staff-scrambler',
            'bg-red-200': assignmentCode === 'staff-runner',
            'bg-blue-200': assignmentCode.match(/judge/i),
            'bg-cyan-200': assignmentCode === 'staff-dataentry',
            'bg-violet-200': assignmentCode === 'staff-announcer',
            'bg-purple-200': assignmentCode === 'staff-delegate',
            'bg-slate-200': !AssignmentCodeRank.includes(assignmentCode),
          };
          const colorClassName = {
            'even:bg-yellow-50': assignmentCode === 'staff-scrambler',
            'even:bg-red-50': assignmentCode === 'staff-runner',
            'even:bg-blue-50': assignmentCode.match(/judge/i),
            'even:bg-cyan-50': assignmentCode === 'staff-dataentry',
            'even:bg-violet-50': assignmentCode === 'staff-announcer',
            'even:bg-purple-50': assignmentCode === 'staff-delegate',
            'even:bg-slate-50': !AssignmentCodeRank.includes(assignmentCode),
          };

          return (
            <>
              <hr className="mb-2" />
              <div>
                <h4
                  className={classNames(
                    'text-lg font-bold text-center shadow-md py-3 px-6',
                    headerColorClassName
                  )}>
                  {AssignmentCodeTitles[assignmentCode] || assignmentCode.replace('staff-', '')}
                </h4>
                {anyHasStationNumber ? (
                  <table className={'w-full text-left'}>
                    <thead>
                      <tr className={classNames(' text-sm shadow-md', headerColorClassName)}>
                        <th className="pt-1 pb-3 px-6">Name</th>
                        <th className="pt-1 pb-3 px-6">Station Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {people
                        .sort((a, b) => {
                          const aStationNumber = stationNumber(assignmentCode)(a);
                          const bStationNumber = stationNumber(assignmentCode)(b);

                          if (
                            aStationNumber &&
                            bStationNumber &&
                            aStationNumber - bStationNumber !== 0
                          ) {
                            return aStationNumber - bStationNumber;
                          }

                          return byName(a, b);
                        })
                        .map((person) => (
                          <Link
                            className={classNames('table-row  hover:opacity-80', colorClassName)}
                            to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                            <td className="py-3 px-6">{person.name}</td>
                            <td className="py-3 px-6">{stationNumber(assignmentCode)(person)}</td>
                          </Link>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="hover:opacity-80">
                    {people.sort(byName).map((person) => (
                      <Link
                        className={classNames(`p-2 block`, colorClassName)}
                        to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                        {person.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          );
        })}
    </>
  );
}
