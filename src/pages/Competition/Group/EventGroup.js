import { decodeMultiResult, formatCentiseconds, formatMultiResult } from '@wca/helpers';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import tw from 'tailwind-styled-components/dist/tailwind';
import { activityCodeToName, byWorldRanking, parseActivityCode } from '../../../lib/activities';
import { byName } from '../../../lib/utils';

const isAssignment = (assignment) => (a) =>
  a.assignments.some(({ assignmentCode }) => assignmentCode === assignment);

const AssignmentCategoryHeader = tw.h4`
text-lg font-bold text-center shadow-md py-3 px-6
`;

export default function EventGroup({ competitionId, activity, persons }) {
  console.log(activity);
  const { eventId } = activity ? parseActivityCode(activity?.activityCode) : {};

  const everyoneInActivity = useMemo(
    () =>
      persons.map((person) => ({
        ...person,
        prSingle: person.personalBests.find((pb) => pb.eventId === eventId && pb.type === 'single'),
        prAverage: person.personalBests.find(
          (pb) => pb.eventId === eventId && pb.type === 'average'
        ),
      })),
    [persons, eventId]
  );

  const competitors = everyoneInActivity
    .filter(isAssignment('competitor'))
    .sort(byWorldRanking(eventId));
  const scramblers = everyoneInActivity.filter(isAssignment('staff-scrambler')).sort(byName);
  const runners = everyoneInActivity.filter(isAssignment('staff-runner')).sort(byName);
  const judges = everyoneInActivity.filter(isAssignment('staff-judge')).sort(byName);

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
        <h3 className="font-bold">{activityCodeToName(activity?.activityCode)}</h3>
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
      {scramblers.length > 0 && (
        <>
          <hr className="mb-2" />
          <div>
            <h4 className="text-lg font-bold text-center bg-yellow-100 shadow-md py-3 px-6">
              Scramblers
            </h4>
            <div className="hover:opacity-80">
              {scramblers.map((person) => (
                <Link
                  className="p-2 block even:bg-yellow-50"
                  to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                  {person.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {runners.length > 0 && (
        <>
          <hr className="mb-2" />
          <div>
            <h4 className="text-lg font-bold text-center bg-red-100 shadow-md py-3 px-6">
              Runners
            </h4>
            <div className="hover:opacity-80">
              {runners.map((person) => (
                <Link
                  className="p-2 block even:bg-red-50"
                  to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                  {person.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {judges.length > 0 && (
        <>
          <hr className="mb-2" />
          <div>
            <AssignmentCategoryHeader className="bg-blue-200">Judges</AssignmentCategoryHeader>

            <div className="">
              {judges.map((person) => (
                <Link
                  className="p-4 block even:bg-blue-50 hover:opacity-80"
                  to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                  {person.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
