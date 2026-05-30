import { getLocalStorage, setLocalStorage } from './localStorage';

const IMPORTED_COMPETITIONS_KEY = 'notifyComp.importedCompetitionIds';

const getImportedCompetitionIds = () => {
  try {
    const rawCompetitionIds = getLocalStorage(IMPORTED_COMPETITIONS_KEY);
    const competitionIds = rawCompetitionIds ? JSON.parse(rawCompetitionIds) : [];

    return Array.isArray(competitionIds)
      ? competitionIds.filter(
          (competitionId): competitionId is string => typeof competitionId === 'string',
        )
      : [];
  } catch {
    return [];
  }
};

export const hasCachedNotifyCompRemoteImport = (competitionId: string) =>
  getImportedCompetitionIds().includes(competitionId);

export const cacheNotifyCompRemoteImport = (competitionId: string) => {
  const competitionIds = getImportedCompetitionIds();
  if (competitionIds.includes(competitionId)) {
    return;
  }

  setLocalStorage(IMPORTED_COMPETITIONS_KEY, JSON.stringify([...competitionIds, competitionId]));
};
