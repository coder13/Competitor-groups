import http from 'http';
import type { NotifierServiceConfig } from './config';
import { deleteSubscription, readStore, upsertSubscription } from './store';

interface SubscriptionPayload {
  endpoint?: string;
  p256dh?: string;
  auth?: string;
  userId?: number;
}

function parseBody(body: string): SubscriptionPayload {
  try {
    return JSON.parse(body) as SubscriptionPayload;
  } catch {
    return {};
  }
}

export function startNotifierApiServer(config: NotifierServiceConfig) {
  const server = http.createServer((req, res) => {
    const url = req.url ?? '';

    if (req.method === 'GET' && url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.method === 'GET' && url === '/subscriptions') {
      void readStore().then((store) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(store.subscriptions));
      });
      return;
    }

    if (req.method === 'POST' && url === '/subscriptions') {
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        const payload = parseBody(Buffer.concat(chunks).toString('utf8'));

        if (!payload.endpoint || !payload.p256dh || !payload.auth || !payload.userId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing endpoint, p256dh, auth, or userId' }));
          return;
        }

        void upsertSubscription({
          userId: payload.userId,
          endpoint: payload.endpoint,
          p256dh: payload.p256dh,
          auth: payload.auth,
        }).then(() => {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        });
      });
      return;
    }

    if (req.method === 'DELETE' && url === '/subscriptions') {
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        const payload = parseBody(Buffer.concat(chunks).toString('utf8'));
        if (!payload.endpoint) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing endpoint' }));
          return;
        }

        void deleteSubscription(payload.endpoint).then(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        });
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(config.apiPort, () => {
    console.log(`[push-notifier] API listening on :${config.apiPort}`);
  });

  return server;
}
