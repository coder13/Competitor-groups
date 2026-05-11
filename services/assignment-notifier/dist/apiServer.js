'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.startNotifierApiServer = startNotifierApiServer;
const http_1 = __importDefault(require('http'));
const store_1 = require('./store');
function parseBody(body) {
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}
function startNotifierApiServer(config) {
  const server = http_1.default.createServer((req, res) => {
    const url = req.url ?? '';
    if (req.method === 'GET' && url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (req.method === 'GET' && url === '/subscriptions') {
      void (0, store_1.readStore)().then((store) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(store.subscriptions));
      });
      return;
    }
    if (req.method === 'POST' && url === '/subscriptions') {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        const payload = parseBody(Buffer.concat(chunks).toString('utf8'));
        if (!payload.endpoint || !payload.p256dh || !payload.auth || !payload.userId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing endpoint, p256dh, auth, or userId' }));
          return;
        }
        void (0, store_1.upsertSubscription)({
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
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        const payload = parseBody(Buffer.concat(chunks).toString('utf8'));
        if (!payload.endpoint) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing endpoint' }));
          return;
        }
        void (0, store_1.deleteSubscription)(payload.endpoint).then(() => {
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
