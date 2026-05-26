import { Competition, Person } from '@wca/helpers';
import { groupActivitiesByRound } from '@/lib/activities';
import { CompetitionRoundResult } from './CompetitionResultsTable';

const hasCompetitionAssignmentForActivity = (activityIds: Set<number>) => (person: Person) =>
  person.assignments?.some(
    (assignment) =>
      assignment.assignmentCode === 'competitor' && activityIds.has(assignment.activityId),
  );

export const getRoundRosterResults = (
  wcif: Competition,
  roundId: string,
): CompetitionRoundResult[] => {
  const groupActivities = groupActivitiesByRound(wcif, roundId);
  const groupActivityIds = new Set(groupActivities.map((activity) => activity.id));

  if (groupActivityIds.size === 0) {
    return [];
  }

  return wcif.persons
    .filter(hasCompetitionAssignmentForActivity(groupActivityIds))
    .map((person) => ({
      id: `roster-${person.registrantId}`,
      personId: person.registrantId,
      ranking: null,
      advancing: false,
      advancingQuestionable: false,
      attempts: [],
      best: 0,
      average: 0,
    }));
};
