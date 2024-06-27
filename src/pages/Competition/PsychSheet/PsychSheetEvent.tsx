import { useParams } from 'react-router-dom';
import { Container } from '../../../components/Container';
import { useWCIF } from '../../../providers/WCIFProvider';
import { acceptedRegistration, isRegisteredForEvent } from '../../../lib/person';
import { EventId } from '@wca/helpers';
import { byWorldRanking } from '../../../lib/activities';
import { unique } from '../../../lib/utils';
import { renderResultByEventId } from '../../../lib/results';

const CountryName = new Intl.DisplayNames(['en'], { type: 'region' });

export const PsychSheetEvent = () => {
  const { eventId } = useParams() as {
    eventId: EventId;
  };
  const { wcif } = useWCIF();

  const persons =
    wcif?.persons.filter(
      (person) => acceptedRegistration(person) && isRegisteredForEvent(eventId)(person)
    ) || [];

  // Creates a proper psychsheet with support for tied rankings
  const sortedPersons = persons.sort(byWorldRanking(eventId)).map((person) => {
    return {
      ...person,
      pr: person.personalBests?.find((pr) => pr.eventId === eventId && pr.type === 'average'),
    };
  });

  const rankings = sortedPersons
    ?.map((person) => person.pr?.worldRanking ?? 0)
    .filter((i) => i > 0)
    .filter(unique);

  return (
    <Container className="pt-2">
      <table className="w-full text-sm sm:text-base">
        <thead className="bg-slate-200">
          <tr>
            <th className="px-6 py-2.5 text-right">#</th>
            <th className="px-6 py-2.5 text-left">Name</th>
            <th className="px-6 py-2.5 text-left hidden sm:table-cell w-40">Country</th>
            <th className="px-6 py-2.5 text-right w-2">Average</th>
            <th className="px-6 py-2.5 text-right hidden lg:table-cell">WR</th>
            <th className="px-6 py-2.5 text-right w-2">Single</th>
            <th className="px-6 py-2.5 text-right hidden lg:table-cell">WR</th>
          </tr>
        </thead>
        <tbody>
          {sortedPersons?.map((person) => {
            const rank =
              (rankings?.findIndex((i) => i === person.pr?.worldRanking) > 0
                ? rankings?.findIndex((i) => i === person.pr?.worldRanking)
                : rankings.length) + 1;

            const prSingle = person.personalBests?.find(
              (pr) => pr.eventId === eventId && pr.type === 'single'
            );

            const prAverage = person.personalBests?.find(
              (pr) => pr.eventId === eventId && pr.type === 'average'
            );

            const countryName = CountryName.of(person.countryIso2);

            return (
              <tr key={person.registrantId} className="even:bg-slate-100  hover:brightness-105">
                <td className="px-6 h-10 text-right">{rank}</td>
                <td className="px-6 h-10 text-left">{person.name}</td>
                <td className="px-6 h-10 text-left hidden sm:table-cell">{countryName}</td>
                <td className="px-6 h-10 text-right">
                  {prAverage ? renderResultByEventId(eventId, 'average', prAverage.best) : ''}
                </td>
                <td className="px-6 h-10 text-right hidden lg:table-cell">
                  {prAverage ? `${prAverage.worldRanking}` : ''}
                </td>
                <td className="px-6 h-10 text-right">
                  {prSingle ? renderResultByEventId(eventId, 'single', prSingle.best) : ''}
                </td>
                <td className="px-6 h-10 text-right hidden lg:table-cell">
                  {prSingle ? `${prSingle.worldRanking}` : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Container>
  );
};
