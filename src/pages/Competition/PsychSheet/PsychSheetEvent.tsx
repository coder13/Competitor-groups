import StickyBox from 'react-sticky-box';
import { EventId } from '@wca/helpers';
import { Link, useParams } from 'react-router-dom';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import classNames from 'classnames';
import { useMediaQuery } from '@uidotdev/usehooks';
import { Container } from '../../../components/Container';
import { useWCIF } from '../../../providers/WCIFProvider';
import { acceptedRegistration, isRegisteredForEvent } from '../../../lib/person';
import { byWorldRanking } from '../../../lib/sort';
import { unique } from '../../../lib/utils';
import { renderResultByEventId } from '../../../lib/results';

// const CountryName = new Intl.DisplayNames(['en'], { type: 'region' });

export const PsychSheetEvent = () => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');

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

  const gridCss = 'grid grid-cols-[3em_2em_1fr_min-content_5em] grid-rows-10';
  console.log(isSmallDevice);

  return (
    <Container className="w-full h-full">
      <div className={classNames('w-full h-full text-sm sm:text-base')}>
        <StickyBox offsetTop={0} offsetBottom={0}>
          <div className={classNames('bg-green-300 w-full', gridCss)} role="rowheader">
            <span className="px-3 py-2.5 text-right font-bold">#</span>
            <span className="px-3 py-2.5 text-left"></span>
            <span className="px-3 py-2.5 text-left font-bold">Name</span>
            <span className="px-3 py-2.5 text-right font-bold">Avg</span>
            <span className="px-3 py-2.5 text-right font-bold">WR</span>
          </div>
        </StickyBox>

        <div className={classNames(gridCss, 'striped')}>
          {sortedPersons?.map((person) => {
            const rank =
              (rankings?.findIndex((i) => i === person.pr?.worldRanking) >= 0
                ? rankings?.findIndex((i) => i === person.pr?.worldRanking)
                : rankings.length) + 1;

            const prAverage = person.personalBests?.find(
              (pr) => pr.eventId === eventId && pr.type === 'average'
            );

            return (
              <Link
                key={person.registrantId}
                className="contents"
                to={`/competitions/${wcif?.id}/personal-bests/${person.wcaId}`}>
                <span className="px-3 py-2.5 text-right flex items-center [font-variant-numeric:tabular-nums]">
                  {rank}
                </span>
                <span className="px-3 py-2.5 text-left flex items-center w-full">
                  {getUnicodeFlagIcon(person.countryIso2)}
                </span>
                <span className="px-3 py-2.5 text-left truncate">{person.name}</span>
                <span className="px-3 py-2.5 text-right [font-variant-numeric:tabular-nums]">
                  {prAverage ? renderResultByEventId(eventId, 'average', prAverage.best) : ''}
                </span>
                <span className="px-3 py-2.5 text-right [font-variant-numeric:tabular-nums]">
                  {prAverage ? `${prAverage.worldRanking}` : ''}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </Container>
  );
};
