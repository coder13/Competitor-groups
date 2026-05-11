'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.sendPushNotifications = sendPushNotifications;
async function sendPushNotifications(params) {
  if (!params.config.vapidPublicKey || !params.config.vapidPrivateKey) {
    console.warn('[push-notifier] Skipping sends: missing VAPID keys');
    return;
  }
  for (const job of params.jobs) {
    const subscriptions = params.subscriptions.filter(
      (subscription) => subscription.userId === job.userId,
    );
    for (const subscription of subscriptions) {
      console.log(
        '[push-notifier] TODO: send web push payload',
        JSON.stringify({
          endpoint: subscription.endpoint,
          userId: subscription.userId,
          title: job.title,
          body: job.body,
          competitionId: job.competitionId,
          dedupeKey: job.dedupeKey,
        }),
      );
    }
  }
}
