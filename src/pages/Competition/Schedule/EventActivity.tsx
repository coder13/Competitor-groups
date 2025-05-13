import {
  Activity,
  activityCodeToName,
  AssignmentCode,
  parseActivityCode,
  Person,
} from '@wca/helpers';
import { useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRooms } from '../../../lib/activities';
import { formatDateTimeRange } from '../../../lib/time';
import { renderResultByEventId } from '../../../lib/results';
import { useWCIF } from '../../../providers/WCIFProvider';
import { isRankedBySingle } from '../../../lib/events';
import { CutoffTimeLimitPanel } from '../../../components/CutoffTimeLimitPanel';
import { PeopleList } from './PeopleList';

const isAssignment = (assignment) => (a) =>
  a.assignments.some(({ assignmentCode }) => assignmentCode === assignment);

interface EventGroupProps {
  competitionId: string;
  activity: Activity;
  persons: Person[];
}

export function EventActivity({ competitionId, activity, persons }: EventGroupProps) {
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
      getRooms(wcif).find((r) =>
        r.activities.some(
          (a) => a.id === activity.id || a?.childActivities?.some((ca) => ca.id === activity.id)
        )
      ),
    [activity.id, wcif]
  );

  const venue = wcif?.schedule.venues?.find((v) => v.rooms.some((r) => r.id === room?.id));
  const timeZone = venue?.timezone;

  const personsWithPRs = useMemo(
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

  const competitors = personsWithPRs.filter(isAssignment('competitor'));

  const assignments = new Set(
    personsWithPRs.map((person) => person.assignments?.map((a) => a.assignmentCode)).flat()
  );

  const peopleByAssignmentCode = (Array.from(assignments.values()) as AssignmentCode[])
    .filter((assignmentCode) => assignmentCode !== 'competitor')
    .reduce((acc, assignmentCode) => {
      acc[assignmentCode] = personsWithPRs.filter(isAssignment(assignmentCode));
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
            {round && <CutoffTimeLimitPanel round={round} className="w-full" />}
          </div>
        </div>
      )}
      <hr className="mb-2" />
      <div>
        <h4 className="bg-green-200 pb-1 text-lg font-bold text-center shadow-md py-3 px-6">
          Competitors <span className="text-sm">({competitors.length})</span>
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
                  key={person.registrantId}
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
      <PeopleList
        competitionId={competitionId}
        activity={activity}
        peopleByAssignmentCode={peopleByAssignmentCode}
      />
    </>
  );
}
