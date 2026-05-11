import { startNotifierApiServer } from './apiServer';
import { getNotifierServiceConfig } from './config';
import { buildNotificationJobs, createAssignmentSnapshots } from './diff';
import { sendPushNotifications } from './pushSender';
import { readStore, saveStore } from './store';
import { fetchWcif } from './wcifClient';

async function runOnce() {
  const config = getNotifierServiceConfig();
  const store = await readStore();

  for (const competitionId of config.competitionIds) {
    const wcif = await fetchWcif(competitionId, {
      apiBaseUrl: config.wcifApiBaseUrl,
      token: config.apiToken,
    });

    const nextSnapshots = createAssignmentSnapshots(wcif);
    const previousSnapshots = store.snapshots.filter(
      (snapshot) => snapshot.competitionId === competitionId,
    );

    const jobs = buildNotificationJobs({ previousSnapshots, nextSnapshots }).filter(
      (job) => !store.deliveredDedupeKeys.includes(job.dedupeKey),
    );

    await sendPushNotifications({
      jobs,
      subscriptions: store.subscriptions,
      config,
    });

    store.snapshots = [
      ...store.snapshots.filter((snapshot) => snapshot.competitionId !== competitionId),
      ...nextSnapshots,
    ];
    store.deliveredDedupeKeys.push(...jobs.map((job) => job.dedupeKey));
  }

  await saveStore(store);
}

async function main() {
  const config = getNotifierServiceConfig();
  startNotifierApiServer(config);

  await runOnce();

  if (process.env.NOTIFIER_RUN_ONCE === 'true') {
    return;
  }

  setInterval(() => {
    void runOnce();
  }, config.wcifPollIntervalMs);
}

void main();
