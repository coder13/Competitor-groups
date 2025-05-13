import { useLocalStorage } from '@uidotdev/usehooks';
import { useCallback } from 'react';

export const usePinnedPersons = (competitionId: string) => {
  const [pinnedPersons, setPinnedPersons] = useLocalStorage<Record<string, number[]>>(
    'pinnedPersons',
    {
      [competitionId]: [],
    },
  );

  const pinPerson = useCallback(
    (registrantId: number) => {
      setPinnedPersons((prev) => ({
        ...prev,
        [competitionId]: [...(prev[competitionId] || []), registrantId],
      }));
    },
    [competitionId, setPinnedPersons],
  );

  const unpinPerson = useCallback(
    (registrantId: number) => {
      setPinnedPersons((prev) => ({
        ...prev,
        [competitionId]: (prev[competitionId] || []).filter((id) => id !== registrantId),
      }));
    },
    [competitionId, setPinnedPersons],
  );

  return {
    pinnedPersons: pinnedPersons[competitionId] || [],
    pinPerson,
    unpinPerson,
  };
};
