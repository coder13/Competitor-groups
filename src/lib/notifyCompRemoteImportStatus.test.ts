import {
  cacheNotifyCompRemoteImport,
  hasCachedNotifyCompRemoteImport,
} from './notifyCompRemoteImportStatus';

jest.mock('./localStorage', () => ({
  getLocalStorage: (key: string) => localStorage.getItem(key),
  setLocalStorage: (key: string, value: string) => localStorage.setItem(key, value),
}));

beforeEach(() => {
  localStorage.clear();
});

it('caches imported NotifyComp competitions by id', () => {
  expect(hasCachedNotifyCompRemoteImport('KentSpring2026')).toBe(false);

  cacheNotifyCompRemoteImport('KentSpring2026');

  expect(hasCachedNotifyCompRemoteImport('KentSpring2026')).toBe(true);
  expect(hasCachedNotifyCompRemoteImport('OtherComp2026')).toBe(false);
});

it('does not duplicate cached competition ids', () => {
  cacheNotifyCompRemoteImport('KentSpring2026');
  cacheNotifyCompRemoteImport('KentSpring2026');

  expect(localStorage.getItem('notifyComp.importedCompetitionIds')).toBe(
    JSON.stringify(['KentSpring2026']),
  );
});

it('ignores malformed cached data', () => {
  localStorage.setItem('notifyComp.importedCompetitionIds', '{not-json');

  expect(hasCachedNotifyCompRemoteImport('KentSpring2026')).toBe(false);
});
