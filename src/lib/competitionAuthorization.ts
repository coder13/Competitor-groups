import { Competition } from '@wca/helpers';
import { isDelegate, isOrganizer } from './person';

interface CompetitionManager {
  id?: number;
}

export const isCompetitionDelegateOrOrganizer = (
  wcif: Competition | null | undefined,
  user: CompetitionManager | null | undefined,
) => {
  if (!wcif || !user?.id) {
    return false;
  }

  const person = wcif.persons.find((candidate) => candidate.wcaUserId === user.id);
  return Boolean(person && (isDelegate(person) || isOrganizer(person)));
};
