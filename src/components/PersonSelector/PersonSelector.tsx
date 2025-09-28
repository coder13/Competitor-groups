import { Person } from '@wca/helpers';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompareSchedulesState } from '@/hooks/useCompareSchedulesState';
import { acceptedRegistration } from '@/lib/person';
import { byName } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';

export interface PersonSelectorProps {
  onPersonToggle?: (person: Person, isSelected: boolean) => void;
  showCurrentUser?: boolean;
  placeholder?: string;
}

export const PersonSelector = ({
  onPersonToggle,
  showCurrentUser = false,
  placeholder,
}: PersonSelectorProps) => {
  const { t } = useTranslation();
  const { wcif } = useWCIF();
  const { user } = useAuth();
  const { selectedPersonIds, togglePerson } = useCompareSchedulesState();
  const [searchInput, setSearchInput] = useState('');

  const persons = useMemo(() => {
    if (!wcif) return [];

    return wcif.persons
      .filter(acceptedRegistration)
      .filter((person) => !!person.registration?.eventIds?.length || !!person.assignments?.length)
      .filter((person) => showCurrentUser || person.wcaUserId !== user?.id)
      .map((person) => ({
        ...person,
        isSelected: selectedPersonIds.includes(person.registrantId),
      }))
      .sort(byName);
  }, [wcif, selectedPersonIds, user?.id, showCurrentUser]);

  const filteredPersons = useMemo(() => {
    if (!searchInput.trim()) return persons;
    return persons.filter((person) =>
      person.name.toLowerCase().includes(searchInput.toLowerCase().trim()),
    );
  }, [persons, searchInput]);

  const handleTogglePerson = (person: Person, isSelected: boolean) => {
    togglePerson(person.registrantId);
    onPersonToggle?.(person, !isSelected);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="search"
          className="block w-full p-3 h-[40px] ps-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder || t('competition.compareSchedules.searchPersons')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="max-h-60 overflow-y-auto">
        {filteredPersons.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            {searchInput.trim()
              ? t('competition.compareSchedules.noPersonsFound')
              : t('competition.compareSchedules.noPersonsAvailable')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {filteredPersons.map((person) => (
              <PersonSelectorItem
                key={person.registrantId}
                person={person}
                isPinned={person.isSelected}
                onToggle={() => handleTogglePerson(person, person.isSelected)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface PersonSelectorItemProps {
  person: Person;
  isPinned: boolean;
  onToggle: () => void;
}

const PersonSelectorItem = ({ person, isPinned, onToggle }: PersonSelectorItemProps) => {
  return (
    <div
      className="flex items-center justify-between p-2 border rounded-md bg-white hover:bg-blue-50 cursor-pointer"
      onClick={onToggle}>
      <div className="flex items-center space-x-2">
        <div className="flex flex-col">
          <span className="font-medium">{person.name}</span>
          <span className="text-sm text-gray-500">
            {person.wcaId ? person.wcaId : `#${person.registrantId}`}
          </span>
        </div>
      </div>
      <button
        className={`p-1 rounded ${
          isPinned ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}>
        <span className={isPinned ? 'fa fa-bookmark' : 'fa-regular fa-bookmark'} />
      </button>
    </div>
  );
};
