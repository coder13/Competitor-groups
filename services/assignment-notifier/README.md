# Assignment Notifier Service (scaffold)

This is a single-service scaffold that polls WCIFs, detects assignment changes, and exposes subscription APIs for push notifications.

## What it includes

- WCIF polling loop
- Assignment hash snapshots and diffing
- Notification job generation with dedupe keys
- Local JSON store for snapshots/subscriptions
- Subscription API server (`/health`, `/subscriptions`)
- Placeholder push sender (ready for Web Push implementation)

## Configure

Create environment variables:

- `WCA_OAUTH_TOKEN` - WCA token with WCIF access
- `WCIF_COMPETITION_IDS` - comma-separated competition IDs
- `WCIF_API_BASE_URL` (optional, defaults to WCA v0 API)
- `WCIF_POLL_INTERVAL_MS` (optional, defaults to 300000)
- `NOTIFIER_API_PORT` (optional, defaults to 8787)
- `VAPID_SUBJECT` (optional, e.g. `mailto:ops@example.com`)
- `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`

## API

- `GET /health`
- `GET /subscriptions`
- `POST /subscriptions` with `{ userId, endpoint, p256dh, auth }`
- `DELETE /subscriptions` with `{ endpoint }`

## Run

```bash
yarn notify:service
```

## Next steps

- Replace `sendPushNotifications` with actual Web Push delivery.
- Move store to a persistent DB.
- Add upcoming-assignment reminder jobs.
- Add auth middleware for subscription API routes.
