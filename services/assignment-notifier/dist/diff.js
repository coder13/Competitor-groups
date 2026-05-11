'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createAssignmentSnapshots = createAssignmentSnapshots;
exports.buildNotificationJobs = buildNotificationJobs;
const crypto_1 = require('crypto');
function hashAssignments(value) {
  return (0, crypto_1.createHash)('sha256')
    .update(JSON.stringify(value ?? null))
    .digest('hex');
}
function createAssignmentSnapshots(wcif) {
  return wcif.persons
    .filter((person) => person.wcaUserId)
    .map((person) => ({
      competitionId: wcif.id,
      personWcaUserId: person.wcaUserId,
      assignmentsHash: hashAssignments(person.assignments),
      fetchedAt: new Date().toISOString(),
    }));
}
function buildNotificationJobs(params) {
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
