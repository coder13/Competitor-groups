import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { PushSubscriptionRecord, ServiceStore } from './types';

const STORE_DIR = path.resolve(process.cwd(), 'services/assignment-notifier/data');
const STORE_PATH = path.resolve(STORE_DIR, 'store.json');

async function ensureStore(): Promise<ServiceStore> {
  try {
    const content = await readFile(STORE_PATH, 'utf8');
    return JSON.parse(content) as ServiceStore;
  } catch {
    return {
      snapshots: [],
      subscriptions: [],
      deliveredDedupeKeys: [],
    };
  }
}

export async function readStore() {
  return ensureStore();
}

export async function saveStore(store: ServiceStore) {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function upsertSubscription(params: {
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
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
    const next: PushSubscriptionRecord = {
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

export async function deleteSubscription(endpoint: string) {
  const store = await readStore();
  store.subscriptions = store.subscriptions.filter(
    (subscription) => subscription.endpoint !== endpoint,
  );
  await saveStore(store);
}
