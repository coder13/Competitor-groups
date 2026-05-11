'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.readStore = readStore;
exports.saveStore = saveStore;
exports.upsertSubscription = upsertSubscription;
exports.deleteSubscription = deleteSubscription;
const promises_1 = require('fs/promises');
const path_1 = __importDefault(require('path'));
const STORE_DIR = path_1.default.resolve(process.cwd(), 'services/assignment-notifier/data');
const STORE_PATH = path_1.default.resolve(STORE_DIR, 'store.json');
async function ensureStore() {
  try {
    const content = await (0, promises_1.readFile)(STORE_PATH, 'utf8');
    return JSON.parse(content);
  } catch {
    return {
      snapshots: [],
      subscriptions: [],
      deliveredDedupeKeys: [],
    };
  }
}
async function readStore() {
  return ensureStore();
}
async function saveStore(store) {
  await (0, promises_1.mkdir)(STORE_DIR, { recursive: true });
  await (0, promises_1.writeFile)(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}
async function upsertSubscription(params) {
  const store = await readStore();
  const now = new Date().toISOString();
  const existing = store.subscriptions.find(
    (subscription) => subscription.endpoint === params.endpoint,
  );
  if (existing) {
    existing.userId = params.userId;
    existing.p256dh = params.p256dh;
    existing.auth = params.auth;
    existing.updatedAt = now;
  } else {
    const next = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: params.userId,
      endpoint: params.endpoint,
      p256dh: params.p256dh,
      auth: params.auth,
      createdAt: now,
      updatedAt: now,
    };
    store.subscriptions.push(next);
  }
  await saveStore(store);
}
async function deleteSubscription(endpoint) {
  const store = await readStore();
  store.subscriptions = store.subscriptions.filter(
    (subscription) => subscription.endpoint !== endpoint,
  );
  await saveStore(store);
}
