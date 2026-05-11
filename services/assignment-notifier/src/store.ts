import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { AssignmentSnapshot, PushSubscriptionRecord } from './types';

interface ServiceStore {
  snapshots: AssignmentSnapshot[];
  subscriptions: PushSubscriptionRecord[];
  deliveredDedupeKeys: string[];
}

const STORE_PATH = path.resolve(process.cwd(), 'services/assignment-notifier/data/store.json');

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
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}
