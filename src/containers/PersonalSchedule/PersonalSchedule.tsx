import { Competition, Person } from '@wca/helpers';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useMemo } from 'react';
import { Button, DisclaimerText, ExternalLink, LinkButton } from '@/components';
import { usePinnedPersons } from '@/hooks/UsePinnedPersons';
import { useWcaLiveCompetitorLink } from '@/hooks/queries/useWcaLive';
import { getRooms } from '@/lib/activities';
import { Assignments } from './Assignments';

export interface PersonalScheduleContainerProps {
  wcif: Competition;
  person: Person;
}

export function PersonalScheduleContainer({ wcif, person }: PersonalScheduleContainerProps) {
  const anyAssignmentsHasStationNumber = !!person.assignments?.some((a) => a.stationNumber);

  const { pinnedPersons, pinPerson, unpinPerson } = usePinnedPersons(wcif.id);
  const isPinned = pinnedPersons.some((i) => i === person.registrantId);

  const { data: wcaLiveLink, status: wcaLiveFetchStatus } = useWcaLiveCompetitorLink(
    wcif.id,
    person.registrantId.toString(),
  );

  const showRoom = useMemo(() => getRooms(wcif).length > 1, [wcif]);

  return (
    <div className="flex flex-col pt-1">
      <div className="flex flex-shrink items-center w-full space-x-1 min-h-10 px-1">
        {hasFlag(person.countryIso2) && (
          <div className="flex flex-shrink text-lg sm:text-xl mx-1">
            {getUnicodeFlagIcon(person.countryIso2)}
          </div>
        )}
        <h3 className="text-xl sm:text-2xl">{person.name}</h3>
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
      {person.wcaId && <span className="px-1">{person.wcaId}</span>}
      <div className="px-1">
        <p className="text-sm sm:text-md">
          <span>Registered Events:</span>
          {person.registration?.eventIds.map((eventId) => (
            <span key={eventId} className={`cubing-icon event-${eventId} mx-1 text-lg`} />
          ))}
        </p>
      </div>
      {person.wcaId && (
        <>
          <hr className="my-2" />
          <div className="px-1 flex flex-col space-y-2">
            <LinkButton
              className=""
              color="green"
              title="View Personal Records"
              to={`/competitions/${wcif.id}/personal-records/${person.wcaId}`}
            />
            {wcaLiveFetchStatus === 'success' && (
              <ExternalLink href={wcaLiveLink}>View Results</ExternalLink>
            )}
          </div>
        </>
      )}

      <hr className="my-2" />
      <DisclaimerText />
      <hr className="my-2" />

      {person.assignments && person.assignments.length > 0 ? (
        <Assignments
          wcif={wcif}
          person={person}
          showRoom={showRoom}
          showStationNumber={anyAssignmentsHasStationNumber}
        />
      ) : (
        <div className="p-2">
          <p>No Assignments.</p>
          <p>Check back later for updates!</p>
        </div>
      )}
    </div>
  );
}
