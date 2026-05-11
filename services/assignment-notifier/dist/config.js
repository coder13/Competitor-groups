'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getNotifierServiceConfig = getNotifierServiceConfig;
function readNumber(name, fallback) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function getNotifierServiceConfig() {
  const competitionIds = (process.env.WCIF_COMPETITION_IDS ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    wcifPollIntervalMs: readNumber('WCIF_POLL_INTERVAL_MS', 5 * 60 * 1000),
    wcifApiBaseUrl: process.env.WCIF_API_BASE_URL ?? 'https://www.worldcubeassociation.org/api/v0',
    apiToken: process.env.WCA_OAUTH_TOKEN ?? '',
    competitionIds,
    apiPort: readNumber('NOTIFIER_API_PORT', 8787),
    vapidSubject: process.env.VAPID_SUBJECT ?? 'mailto:notifications@example.com',
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? '',
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? '',
  };
}
