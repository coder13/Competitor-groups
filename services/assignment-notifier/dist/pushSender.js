'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.sendPushNotifications = sendPushNotifications;
async function sendPushNotifications(params) {
  for (const job of params.jobs) {
    const subscriptions = params.subscriptions.filter(
      (subscription) => subscription.userId === job.userId,
    );
    for (const subscription of subscriptions) {
      console.log(
        '[push-notifier] send placeholder push',
        JSON.stringify({
          userId: subscription.userId,
          endpoint: subscription.endpoint,
          competitionId: job.competitionId,
          dedupeKey: job.dedupeKey,
        }),
      );
    }
  }
}
