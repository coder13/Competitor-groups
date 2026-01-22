import { Competition, Person } from '@wca/helpers';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePinnedPersons } from '@/hooks/UsePinnedPersons';
import { useOngoingActivities } from '@/hooks/useOngoingActivities';
import { acceptedRegistration } from '@/lib/person';
import { byName } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { CompetitorListItem } from './CompetitorListItem';

export const Competitors = ({ wcif }: { wcif: Competition }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const { competitionId } = useParams() as { competitionId: string };
  const { user } = useAuth();

  const { pinnedPersons } = usePinnedPersons(competitionId);
  const { ongoingActivities } = useOngoingActivities(competitionId!);

  const acceptedPersons = useMemo(
    () =>
      wcif?.persons
        ?.filter(acceptedRegistration)
        .filter((person) => !!person.registration?.eventIds?.length || !!person.assignments?.length)
        .map((person) => {
          const assignedActivity = person.assignments?.find((a) =>
            ongoingActivities.some((oa) => oa.id === a.activityId),
          );

          return {
            ...person,
            highlight: person.wcaUserId === user?.id,
            pinned: pinnedPersons.includes(person.registrantId),
            currentAssignmentCode: assignedActivity?.assignmentCode,
          };
        })
        .sort(byName) || [],
    [ongoingActivities, pinnedPersons, user?.id, wcif?.persons],
  );

  const me = acceptedPersons.find((person) => person.wcaUserId === user?.id);
  const everyoneButMe = acceptedPersons.filter((person) => person.wcaUserId !== user?.id);

  const acceptedPinnedPersons = everyoneButMe.filter((person) => person.pinned);

  const acceptedUnpinnedPersons = everyoneButMe.filter(
    (person) =>
      !person.pinned &&
      (!input ||
        person.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(
            input
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .trim(),
          )),
  );

  return (
    <div className="space-y-2">
      {me && (
        <CompetitorListItem
          highlight
          person={me}
          currentAssignmentCode={me.currentAssignmentCode}
        />
      )}
      <CompetitorList persons={acceptedPinnedPersons} />

      <div className="w-full">
        <label
          htmlFor="default-search"
          className="mb-2 type-label text-gray-900 sr-only dark:text-white">
          {t('common.search')}
        </label>
        <div className="relative">
          <input
            type="search"
            id="competitor-search"
            className="input h-[40px]"
            placeholder={t('competition.competitors.searchCompetitors')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
      </div>

      <CompetitorList persons={acceptedUnpinnedPersons} />
    </div>
  );
};

const CompetitorList = ({
  persons,
}: {
  persons: (Person & {
    pinned: boolean;
    highlight: boolean;
    currentAssignmentCode?: string;
  })[];
}) => {
  return (
    <ul className="">
      {persons.map((person) => {
        return (
          <CompetitorListItem
            highlight={person.highlight}
            bookmarked={person.pinned}
            key={person.registrantId}
            person={person}
            currentAssignmentCode={person.currentAssignmentCode}
          />
        );
      })}
    </ul>
  );
};
