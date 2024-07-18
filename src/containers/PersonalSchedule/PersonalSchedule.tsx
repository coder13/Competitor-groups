import { useMemo } from 'react';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { Link } from 'react-router-dom';
import { Competition, Person } from '@wca/helpers';
import { getRooms } from '../../lib/activities';
import DisclaimerText from '../../components/DisclaimerText';
import { Assignments } from './Assignments';
import { usePinnedPersons } from '../../hooks/UsePinnedPersons';
import { Button } from '../../components/Button';

export interface PersonalScheduleContainerProps {
  wcif: Competition;
  person: Person;
}

export function PersonalScheduleContainer({ wcif, person }: PersonalScheduleContainerProps) {
  const anyAssignmentsHasStationNumber = !!person.assignments?.some((a) => a.stationNumber);

  const { pinnedPersons, pinPerson, unpinPerson } = usePinnedPersons(wcif.id);
  const isPinned = pinnedPersons.some((i) => i === person.registrantId);

  return (
    <div className="flex flex-col p-1">
      <div className="p-1">
        <div className="flex justify-between items-center">
          <div className="flex flex-shrink items-center w-full space-x-2">
            <h3 className="text-xl sm:text-2xl">{person.name}</h3>
            {hasFlag(person.countryIso2) && (
              <div className="flex flex-shrink ml-2 text-lg sm:text-xl">
                {getUnicodeFlagIcon(person.countryIso2)}
              </div>
            )}
            <div className="flex-grow" />
            <span className="text-xl sm:text-2xl">{person.registrantId}</span>
            <Button
              className="bg-blue-200"
              onClick={() => {
                if (isPinned) {
                  unpinPerson(person.registrantId);
                } else {
                  pinPerson(person.registrantId);
                }
              }}>
              {isPinned ? (
                <span className="fa fa-bookmark text-yellow-500" />
              ) : (
                <span className="fa-regular fa-bookmark" />
              )}
            </Button>
          </div>
        </div>
        {person.wcaId && (
          <Link
            to={`/competitions/${wcif?.id}/personal-bests/${person.wcaId}`}
            className="text-sm sm:text-base text-blue-800 hover:underline">
            {person.wcaId}
          </Link>
        )}
        <p className="text-sm sm:text-md">
          <span>Registered Events:</span>
          {person.registration?.eventIds.map((eventId) => (
            <span key={eventId} className={`cubing-icon event-${eventId} mx-1 text-lg`} />
          ))}
        </p>
      </div>
      <hr className="my-2" />

      <hr className="my-2" />
      <DisclaimerText />
      <hr className="my-2" />

      {person.assignments && person.assignments.length > 0 ? (
        <Assignments
          wcif={wcif}
          person={person}
          showRoom={useMemo(() => getRooms(wcif).length > 1, [wcif])}
          showStationNumber={anyAssignmentsHasStationNumber}
        />
      ) : (
        <div>No Assignments</div>
      )}
    </div>
  );
}
{
  /* <span className="text-xl sm:text-2xl">{person.registrantId}</span> */
}
