import {
  Activity,
  AssignmentCode,
  decodeMultiResult,
  EventId,
  formatCentiseconds,
  formatMultiResult,
  Person,
} from '@wca/helpers';
import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import tw from 'tailwind-styled-components/dist/tailwind';
import {
  activityCodeToName,
  byWorldRanking,
  parseActivityCode,
  rooms,
} from '../../../lib/activities';
import { byName, formatDateTimeRange } from '../../../lib/utils';
import { useWCIF } from '../WCIFProvider';

const isAssignment = (assignment) => (a) =>
  a.assignments.some(({ assignmentCode }) => assignmentCode === assignment);

const AssignmentCodeRank: AssignmentCode[] = [
  'staff-scrambler',
  'staff-runner',
  'staff-judge',
  'staff-dataentry',
  'staff-announcer',
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
};

interface EventGroupProps {
  competitionId: string;
  activity: Activity;
  persons: Person[];
}

export default function EventGroup({ competitionId, activity, persons }: EventGroupProps) {
  const { setTitle, wcif } = useWCIF();
  console.log(activity);
  const { eventId } = parseActivityCode(activity?.activityCode || '');

  useEffect(() => {
    if (activity) {
      setTitle(activityCodeToName(activity.activityCode));
    }
  }, [activity, setTitle]);

  const room = rooms(wcif).find((r) =>
    r.activities.some(
      (a) => a.id === activity.id || a?.childActivities?.some((ca) => ca.id === activity.id)
    )
  );

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

  const competitors = everyoneInActivity
    .filter(isAssignment('competitor'))
    .sort(byWorldRanking(eventId as EventId));

  const assignments = new Set(
    everyoneInActivity.map((person) => person.assignments?.map((a) => a.assignmentCode)).flat()
  );

  const peopleByAssignmentCode = (Array.from(assignments.values()) as AssignmentCode[])
    .filter((assignmentCode) => assignmentCode !== 'competitor')
    .reduce((acc, assignmentCode) => {
      acc[assignmentCode] = everyoneInActivity.filter(isAssignment(assignmentCode));
      return acc;
    }, {});

  // TODO: Calculate seed result from previous round results when available.
  const seedResult = (person) => {
    const result = person.prAverage?.best || person.bPRSingle?.best;
    if (!result) {
      return '';
    }

    if (eventId === '333mbf') {
      return formatMultiResult(decodeMultiResult(result));
    }

    if (eventId === '333fm') {
      return (result / 100).toFixed(2).toString();
    }

    return formatCentiseconds(result);
  };

  const stationNumber = (person) => {
    const assignment = person.assignments.find(
      (a) => a.assignmentCode === 'competitor' && a.activityId === activity.id
    );
    return assignment?.stationNumber;
  };

  return (
    <>
      <div className="p-2">
        <h3 className="font-bold">
          {room?.name}: {activityCodeToName(activity?.activityCode)}
        </h3>
        <p>{formatDateTimeRange(activity.startTime, activity.endTime)}</p>
      </div>
      <hr className="mb-2" />
      <div>
        <AssignmentCategoryHeader className="bg-green-200 pb-1">
          Competitors
        </AssignmentCategoryHeader>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-green-200 shadow-md">
              <th className="pt-1 pb-3 px-6">Name</th>
              <th className="pt-1 pb-3 px-6">Seed Result</th>
              <th className="pt-1 pb-3 px-6">Station Number</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((person) => (
              <Link
                className="table-row even:bg-green-50 hover:opacity-80"
                to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                <td className="py-3 px-6">{person.name}</td>
                <td className="py-3 px-6">{seedResult(person)}</td>
                <td className="py-3 px-6">{stationNumber(person)}</td>
              </Link>
            ))}
          </tbody>
        </table>
      </div>
      {Object.keys(peopleByAssignmentCode)
        .sort((a, b) => AssignmentCodeRank.indexOf(a) - AssignmentCodeRank.indexOf(b))
        .map((assignmentCode) => {
          const people = peopleByAssignmentCode[assignmentCode].sort(byName);

          return (
            <>
              <hr className="mb-2" />
              <div>
                <h4
                  className={classNames(`text-lg font-bold text-center shadow-md py-3 px-6`, {
                    'bg-yellow-100': assignmentCode === 'staff-scrambler',
                    'bg-red-200': assignmentCode === 'staff-runner',
                    'bg-blue-200': assignmentCode.match(/judge/i),
                    'bg-cyan-200': assignmentCode === 'staff-dataentry',
                    'bg-violet-200': assignmentCode === 'staff-announcer',
                    'bg-slate-200': !AssignmentCodeRank.includes(assignmentCode),
                  })}>
                  {AssignmentCodeTitles[assignmentCode] || assignmentCode.replace('staff-', '')}
                </h4>
                <div className="hover:opacity-80">
                  {people.map((person) => (
                    <Link
                      className={classNames(`p-2 block`, {
                        'even:bg-yellow-50': assignmentCode === 'staff-scrambler',
                        'even:bg-red-50': assignmentCode === 'staff-runner',
                        'even:bg-blue-50': assignmentCode.match(/judge/i),
                        'even:bg-cyan-50': assignmentCode === 'staff-dataentry',
                        'even:bg-violet-50': assignmentCode === 'staff-announcer',
                        'even:bg-slate-50': !AssignmentCodeRank.includes(assignmentCode),
                      })}
                      to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                      {person.name}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          );
        })}
    </>
  );
}
