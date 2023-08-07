import { Activity, AssignmentCode, EventId, Person } from '@wca/helpers';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import tw from 'tailwind-styled-components/dist/tailwind';
import {
  activityCodeToName,
  byWorldRanking,
  parseActivityCode,
  rooms,
} from '../../../lib/activities';
import { byName, formatDateTimeRange, renderResultByEventId } from '../../../lib/utils';
import { useWCIF } from '../WCIFProvider';
import { isRankedBySingle } from '../../../lib/events';

const isAssignment = (assignment) => (a) =>
  a.assignments.some(({ assignmentCode }) => assignmentCode === assignment);

const AssignmentCodeRank: AssignmentCode[] = [
  'staff-scrambler',
  'staff-runner',
  'staff-judge',
  'staff-dataentry',
  'staff-announcer',
  'staff-delegate',
];

const AssignmentCategoryHeader = tw.h4`
text-lg font-bold text-center shadow-md py-3 px-6
`;

const AssignmentCodeTitles = {
  'staff-scrambler': 'Scramblers',
  'staff-runner': 'Runners',
  'staff-judge': 'Judges',
  'staff-dataentry': 'Data Entry',
  'staff-announcer': 'Announcers',
  'staff-delegate': 'Delegates',
};

interface EventGroupProps {
  competitionId: string;
  activity: Activity;
  persons: Person[];
}

export default function EventGroup({ competitionId, activity, persons }: EventGroupProps) {
  const { setTitle, wcif } = useWCIF();
  const { eventId, roundNumber } = parseActivityCode(activity?.activityCode || '');
  const event = useMemo(() => wcif?.events.find((e) => e.id === eventId), [wcif]);
  const prevRound = useMemo(
    () => roundNumber && event?.rounds?.find((r) => r.id === `${eventId}-r${roundNumber - 1}`),
    [event]
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
    [prevRound]
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
    [prevRound]
  );

  const stationNumber = (assignmentCode) => (person) => {
    const assignment = person.assignments.find(
      (a) => a.assignmentCode === assignmentCode && a.activityId === activity.id
    );
    return assignment?.stationNumber;
  };

  const anyCompetitorHasStationNumber = competitors.some(stationNumber('competitor'));

  return (
    <>
      {wcif && (
        <div className="p-2">
          <h3 className="font-bold" style={{ lineHeight: 2 }}>
            <Link
              className="px-3 py-2 rounded mr-2"
              style={{
                backgroundColor: `${room?.color}70`,
              }}
              to={`/competitions/${wcif.id}/rooms/${room?.id}`}>
              {room?.name}
            </Link>
            <span>{activityCodeToName(activity?.activityCode)}</span>
          </h3>
          <p className="p-2">
            {formatDateTimeRange(activity.startTime, activity.endTime, 5, timeZone)}
          </p>
        </div>
      )}
      <hr className="mb-2" />
      <div>
        <AssignmentCategoryHeader className="bg-green-200 pb-1">
          Competitors
        </AssignmentCategoryHeader>
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
              .sort((a, b) => a.seedRank - b.seedRank)
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
                <AssignmentCategoryHeader className={classNames(headerColorClassName)}>
                  {AssignmentCodeTitles[assignmentCode] || assignmentCode.replace('staff-', '')}
                </AssignmentCategoryHeader>
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
