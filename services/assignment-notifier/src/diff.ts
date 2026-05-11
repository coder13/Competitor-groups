import { createHash } from 'crypto';
import type { AssignmentSnapshot, NotificationJob, WcifPayload } from './types';

function hashAssignments(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(value ?? null))
    .digest('hex');
}

export function createAssignmentSnapshots(wcif: WcifPayload): AssignmentSnapshot[] {
  return wcif.persons
    .filter((person) => person.wcaUserId)
    .map((person) => ({
      competitionId: wcif.id,
      personWcaUserId: person.wcaUserId,
      assignmentsHash: hashAssignments(person.assignments),
      fetchedAt: new Date().toISOString(),
    }));
}

export function buildNotificationJobs(params: {
  previousSnapshots: AssignmentSnapshot[];
  nextSnapshots: AssignmentSnapshot[];
}): NotificationJob[] {
  const previousByUser = new Map(
    params.previousSnapshots.map((snapshot) => [
      `${snapshot.competitionId}:${snapshot.personWcaUserId}`,
      snapshot,
    ]),
  );

  return params.nextSnapshots.flatMap((snapshot) => {
    const id = `${snapshot.competitionId}:${snapshot.personWcaUserId}`;
    const previous = previousByUser.get(id);

    if (!previous || previous.assignmentsHash === snapshot.assignmentsHash) {
      return [];
    }

    const dedupeKey = `assignment-update:${id}:${snapshot.assignmentsHash}`;

    return [
      {
        id: `${Date.now()}:${id}`,
        userId: snapshot.personWcaUserId,
        competitionId: snapshot.competitionId,
        title: 'New assignment update',
        body: 'Your assignments were updated. Open the app to review the latest groups.',
        dedupeKey,
        createdAt: new Date().toISOString(),
      },
    ];
  });
}
