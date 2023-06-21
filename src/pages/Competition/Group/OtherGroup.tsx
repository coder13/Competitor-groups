import { Activity, AssignmentCode, Person } from '@wca/helpers';
import { useEffect, useMemo } from 'react';
import { activityDurationString, rooms } from '../../../lib/activities';
import { useWCIF } from '../WCIFProvider';
import { byName } from '../../../lib/utils';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

interface OtherGroupProps {
  competitionId: string;
  activity: Activity;
  persons: Person[];
}

const isAssignment = (assignment) => (a) =>
  a.assignments.some(({ assignmentCode }) => assignmentCode === assignment);

const AssignmentCodeRank: AssignmentCode[] = [
  'staff-scrambler',
  'staff-runner',
  'staff-judge',
  'staff-dataentry',
  'staff-announcer',
];

const AssignmentCodeTitles = {
  'staff-scrambler': 'Scramblers',
  'staff-runner': 'Runners',
  'staff-judge': 'Judges',
  'staff-dataentry': 'Data Entry',
  'staff-announcer': 'Announcers',
};

export default function OtherGroup({ competitionId, activity, persons }: OtherGroupProps) {
  const { setTitle, wcif } = useWCIF();

  useEffect(() => {
    if (activity) {
      setTitle(activity.activityCode);
    }
  }, [activity, setTitle]);

  const room = rooms(wcif).find((r) =>
    r.activities.some(
      (a) => a.id === activity.id || a?.childActivities?.some((ca) => ca.id === activity.id)
    )
  );

  const venue = wcif.schedule.venues?.find((v) => v.rooms.some((r) => r.id === room?.id));
  const timeZone = venue?.timezone;

  const assignments = useMemo(
    () => new Set(persons.map((person) => person.assignments?.map((a) => a.assignmentCode)).flat()),
    [persons]
  );

  const peopleByAssignmentCode = (Array.from(assignments.values()) as AssignmentCode[])
    .filter((assignmentCode) => assignmentCode !== 'competitor')
    .reduce((acc, assignmentCode) => {
      acc[assignmentCode] = persons.filter(isAssignment(assignmentCode));
      return acc;
    }, {});

  console.log(activity.extensions);

  return (
    <>
      <div className="p-2">
        <h3 className="font-bold">{activity.name || activity.activityCode}</h3>
        <p>
          Time: {new Date(activity.startTime).toLocaleDateString()}{' '}
          {activityDurationString(activity, timeZone)}
        </p>
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
