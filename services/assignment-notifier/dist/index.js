'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const diff_1 = require('./diff');
const config_1 = require('./config');
const pushSender_1 = require('./pushSender');
const store_1 = require('./store');
const wcifClient_1 = require('./wcifClient');
async function runOnce() {
  const config = (0, config_1.getNotifierServiceConfig)();
  const store = await (0, store_1.readStore)();
  for (const competitionId of config.competitionIds) {
    const wcif = await (0, wcifClient_1.fetchWcif)(competitionId, {
      apiBaseUrl: config.wcifApiBaseUrl,
      token: config.apiToken,
    });
    const nextSnapshots = (0, diff_1.createAssignmentSnapshots)(wcif);
    const previousSnapshots = store.snapshots.filter(
      (snapshot) => snapshot.competitionId === competitionId,
    );
    const jobs = (0, diff_1.buildNotificationJobs)({ previousSnapshots, nextSnapshots }).filter(
      (job) => !store.deliveredDedupeKeys.includes(job.dedupeKey),
    );
    await (0, pushSender_1.sendPushNotifications)({
      jobs,
      subscriptions: store.subscriptions,
    });
    store.snapshots = [
      ...store.snapshots.filter((snapshot) => snapshot.competitionId !== competitionId),
      ...nextSnapshots,
    ];
    store.deliveredDedupeKeys.push(...jobs.map((job) => job.dedupeKey));
  }
  await (0, store_1.saveStore)(store);
}
async function main() {
  const config = (0, config_1.getNotifierServiceConfig)();
  await runOnce();
  if (process.env.NOTIFIER_RUN_ONCE === 'true') {
    return;
  }
  setInterval(() => {
    void runOnce();
  }, config.wcifPollIntervalMs);
}
void main();
