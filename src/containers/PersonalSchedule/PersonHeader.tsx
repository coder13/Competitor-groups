import { Person } from '@wca/helpers';
import classNames from 'classnames';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ExternalLink, LinkButton } from '@/components';
import { usePinnedPersons } from '@/hooks/UsePinnedPersons';
import { useWcaLiveCompetitorLink } from '@/hooks/queries/useWcaLive';
import { useWCIF } from '@/providers/WCIFProvider';

export interface PersonHeaderProps {
  competitionId;
  person: Person;
}

export const PersonHeader: React.FC<PersonHeaderProps> = ({ person }) => {
  const { t } = useTranslation();

  const { competitionId } = useWCIF();
  const { pinnedPersons, pinPerson, unpinPerson } = usePinnedPersons(competitionId);
  const isPinned = pinnedPersons.some((i) => i === person.registrantId);

  const { data: wcaLiveLink, status: wcaLiveFetchStatus } = useWcaLiveCompetitorLink(
    competitionId,
    person.registrantId.toString(),
  );

  const registeredEventIconClassNames = useMemo(() => {
    const officialEventIds = person.registration?.eventIds || [];

    const unofficialEventIds =
      person.roles
        ?.filter((role) => role.startsWith('event-'))
        .map((i) => i.replace('event-', '')) || [];

    return [
      ...officialEventIds.map((i) => `event-${i}`),
      ...unofficialEventIds.map((i) => `unofficial-${i}`),
    ];
  }, [person.registration?.eventIds, person.roles]);

  return (
    <>
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
          <PinIcon pinned={isPinned} />
        </Button>
      </div>
      {person.wcaId && <span className="px-1">{person.wcaId}</span>}
      <div className="px-1">
        <p className="text-sm sm:text-md">
          <span>{t('competition.personalSchedule.registeredEvents')}:</span>
          {registeredEventIconClassNames.map((eventId) => (
            <span key={eventId} className={classNames(`cubing-icon ${eventId} mx-1 text-lg`)} />
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
              title={t('competition.personalSchedule.viewPersonalRecords')}
              to={`/competitions/${competitionId}/personal-records/${person.wcaId}`}
            />
            {wcaLiveFetchStatus === 'success' && (
              <ExternalLink href={wcaLiveLink}>
                {t('competition.personalSchedule.viewResults')}
              </ExternalLink>
            )}
          </div>
        </>
      )}
    </>
  );
};

const PinIcon = ({ pinned }: { pinned: boolean }) => (
  <span className={pinned ? 'fa fa-bookmark text-yellow-500' : 'fa-regular fa-bookmark'} />
);
