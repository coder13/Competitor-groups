# Assignment Notifier Service (scaffold)

This is a single-service scaffold that polls WCIFs, detects assignment changes, and dispatches placeholder push notifications.

## What it includes

- WCIF polling loop
- Assignment hash snapshots and diffing
- Notification job generation with dedupe keys
- Local JSON store for snapshots/subscriptions
- Placeholder push sender (logs output)

## Configure

Create environment variables:

- `WCA_OAUTH_TOKEN` - WCA token with WCIF access
- `WCIF_COMPETITION_IDS` - comma-separated competition IDs
- `WCIF_API_BASE_URL` (optional, defaults to WCA v0 API)
- `WCIF_POLL_INTERVAL_MS` (optional, defaults to 300000)

## Run

```bash
yarn notify:service
```

## Next steps

- Replace `sendPushNotifications` with actual Web Push delivery.
- Add API routes to register/remove subscriptions.
- Move store to a persistent DB.
- Add upcoming-assignment reminder jobs.
