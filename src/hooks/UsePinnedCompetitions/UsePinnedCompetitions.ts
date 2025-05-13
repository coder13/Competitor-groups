import { useLocalStorage } from '@uidotdev/usehooks';
import { useCallback } from 'react';

export const usePinnedCompetitions = () => {
  const [pinnedCompetitions, setPinnedCompetitions] = useLocalStorage<ApiCompetition[]>(
    'pinnedCompetitions',
    []
  );

  const pinCompetition = useCallback(
    (competition: ApiCompetition) => {
      setPinnedCompetitions((prev) => {
        if (prev.some((c) => c.id === competition.id)) {
          return prev;
        }

        return [...prev, competition];
      });
    },
    [setPinnedCompetitions]
  );

  const unpinCompetition = useCallback(
    (competitionId: string) => {
      setPinnedCompetitions((prev) => {
        return prev.filter((c) => c.id !== competitionId);
      });
    },
    [setPinnedCompetitions]
  );

  return {
    pinnedCompetitions,
    pinCompetition,
    unpinCompetition,
  };
};
