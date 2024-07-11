import { useMemo } from 'react';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { Link } from 'react-router-dom';
import { Competition, Person } from '@wca/helpers';
import { getAllActivities, getRooms } from '../../lib/activities';
import DisclaimerText from '../../components/DisclaimerText';
import { Assignments } from './Assignments';
import { useNow } from '../../hooks/useNow';
import { PersonalNormalAssignment } from './PersonalNormalAssignment';

export interface PersonalScheduleContainerProps {
  wcif: Competition;
  person: Person;
}

export function PersonalScheduleContainer({ wcif, person }: PersonalScheduleContainerProps) {
  const anyAssignmentsHasStationNumber = !!person.assignments?.some((a) => a.stationNumber);

  return (
    <div className="flex flex-col p-1">
      <div className="p-1">
        <div className="flex justify-between items-center">
          <div className="flex flex-shrink items-center">
            <h3 className="text-xl sm:text-2xl">{person.name}</h3>
            {hasFlag(person.countryIso2) && (
              <div className="flex flex-shrink ml-2 text-lg sm:text-xl">
                {getUnicodeFlagIcon(person.countryIso2)}
              </div>
            )}
          </div>
          <span className="text-xl sm:text-2xl">{person.registrantId}</span>
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
