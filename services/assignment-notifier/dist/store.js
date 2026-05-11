'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.readStore = readStore;
exports.saveStore = saveStore;
const promises_1 = require('fs/promises');
const path_1 = __importDefault(require('path'));
const STORE_PATH = path_1.default.resolve(
  process.cwd(),
  'services/assignment-notifier/data/store.json',
);
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
  await (0, promises_1.writeFile)(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}
