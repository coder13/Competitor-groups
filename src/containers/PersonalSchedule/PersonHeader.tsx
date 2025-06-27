import { Person } from '@wca/helpers';
import classNames from 'classnames';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ExternalLink, LinkButton } from '@/components';
import { usePinnedPersons } from '@/hooks/UsePinnedPersons';
import { useWcaLiveCompetitorLink } from '@/hooks/queries/useWcaLive';
import { useWCIF } from '@/providers/WCIFProvider';

const fallbackAvatarUrl =
  'https://assets.worldcubeassociation.org/assets/326cd49/assets/missing_avatar_thumb-d77f478a307a91a9d4a083ad197012a391d5410f6dd26cb0b0e3118a5de71438.png';

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

  const avatarUrl = person?.avatar?.thumbUrl || person?.avatar?.url || fallbackAvatarUrl;

  const avatar = <img src={avatarUrl} alt={person.name} className="w-24 h-24 object-contain" />;

  return (
    <>
      <div className="flex space-x-1 px-1">
        {person.wcaId ? (
          <Link to={`https://worldcubeassociation.org/persons/${person.wcaId}`} target="_blank">
            {avatar}
          </Link>
        ) : (
          avatar
        )}
        <div className="flex flex-col w-full">
          <div className="flex flex-shrink items-center w-full space-x-1">
            <h3 className="text-xl sm:text-2xl">{person.name}</h3>
            <div className="flex-grow" />
            <span className="text-xl sm:text-2xl">{person.registrantId}</span>
            <Button
              className="bg-blue-200 min-h-10"
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
          <div className="flex space-x-1 align-center">
            {hasFlag(person.countryIso2) && (
              <div className="flex flex-shrink text-lg sm:text-xl">
                {getUnicodeFlagIcon(person.countryIso2)}
              </div>
            )}

            {person.wcaId && <span className="text-sm sm:text-md my-1">{person.wcaId}</span>}
          </div>
          <div className="px-1">
            <p className="text-sm sm:text-md">
              <span>{t('competition.personalSchedule.registeredEvents')}:</span>
              {registeredEventIconClassNames.map((eventId) => (
                <span key={eventId} className={classNames(`cubing-icon ${eventId} mx-1 text-lg`)} />
              ))}
            </p>
          </div>
        </div>
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
