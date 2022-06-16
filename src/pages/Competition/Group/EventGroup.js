import { decodeMultiResult, formatCentiseconds, formatMultiResult } from '@wca/helpers';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { activityCodeToName, byWorldRanking, parseActivityCode } from '../../../lib/activities';
import { byName } from '../../../lib/utils';

const isAssignment = (assignment) => (a) =>
  a.assignments.some(({ assignmentCode }) => assignmentCode === assignment);

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
  const judges = everyoneInActivity.filter(isAssignment('staff-judge')).sort(byName);

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

  return (
    <>
      <div className="p-2">
        <h3 className="font-bold">{activityCodeToName(activity?.activityCode)}</h3>
      </div>
      <hr className="mb-2" />
      <div>
        <h4 className="p-2 text-lg font-bold text-center">Competitors</h4>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-200 shadow-md">
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Seed Result</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((person) => (
              <Link
                className="table-row even:bg-slate-50"
                to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                <td className="py-3 px-6">{person.name}</td>
                <td className="py-3 px-6">{seedResult(person)}</td>
              </Link>
            ))}
          </tbody>
        </table>
      </div>
      {scramblers.length > 0 && (
        <>
          <hr className="mb-2" />
          <div>
            <h4 className="text-lg font-bold text-center">Scramblers</h4>
            <div className="">
              {scramblers.map((person) => (
                <Link
                  className="p-2 block even:bg-slate-50"
                  to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                  {person.name}
                </Link>
              ))}
            </div>
            ``
          </div>
        </>
      )}

      {judges.length > 0 && (
        <>
          <hr className="mb-2" />
          <div>
            <h4 className="text-lg font-bold text-center">Judges</h4>

            <div className="">
              {judges.map((person) => (
                <Link
                  className="p-4 block even:bg-slate-50"
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
