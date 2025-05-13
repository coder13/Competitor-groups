import { EventId, Person } from '@wca/helpers';
import { findPR } from './activities';
import { isRankedBySingle } from './events';

export const byWorldRanking = (eventId: EventId): ((a: Person, b: Person) => number) => {
  // const byEventRanking = byRanking(eventId);
  const findEventPR = findPR(eventId);

  return (a, b) => {
    if (!isRankedBySingle(eventId)) {
      const aPRAverage = findEventPR(a.personalBests || [], 'average');
      const bPRAverage = findEventPR(b.personalBests || [], 'average');

      if (aPRAverage && bPRAverage) {
        const diff = aPRAverage.worldRanking - bPRAverage.worldRanking;
        if (diff !== 0) {
          return diff;
        }
      } else if (aPRAverage && !bPRAverage) {
        return -1;
      } else if (!aPRAverage && bPRAverage) {
        return 1;
      }
    }

    const aPRSingle = findEventPR(a.personalBests || [], 'single');
    const bPRSingle = findEventPR(b.personalBests || [], 'single');

    if (aPRSingle && bPRSingle) {
      const diff = aPRSingle.worldRanking - bPRSingle.worldRanking;
      if (diff !== 0) {
        return diff;
      }
    } else if (aPRSingle && !bPRSingle) {
      return -1;
    } else if (!aPRSingle && bPRSingle) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  };
};
