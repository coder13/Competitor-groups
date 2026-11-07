import { createScrollPositionStore, SCROLL_STORAGE_KEY } from './scrollPositions';

beforeEach(() => sessionStorage.clear());
afterEach(() => jest.restoreAllMocks());

it('persists only in sessionStorage and isolates entries, including repeated URLs and searches', () => {
  const localWrite = jest.spyOn(Storage.prototype, 'setItem');
  const store = createScrollPositionStore();
  store.set('first', '/groups?q=amy', { competition: { left: 10, top: 700 } });
  store.set('second', '/groups?q=amy', { competition: { left: 0, top: 200 } });
  store.set('third', '/groups?q=bob', { competition: { left: 0, top: 300 } });
  const reloaded = createScrollPositionStore();
  expect(reloaded.get('first', '/groups?q=amy')?.competition.top).toBe(700);
  expect(reloaded.get('second', '/groups?q=amy')?.competition.top).toBe(200);
  expect(reloaded.get('third', '/groups?q=bob')?.competition.top).toBe(300);
  expect(reloaded.get('first', '/groups?q=bob')).toBeUndefined();
  expect(localWrite.mock.contexts.every((context) => context === sessionStorage)).toBe(true);
  sessionStorage.clear();
  expect(createScrollPositionStore().get('first', '/groups?q=amy')).toBeUndefined();
});

it.each(['broken json', '{}', 'null', '[null,3,{},[]]'])(
  'ignores malformed session storage: %s',
  (value) => {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, value);
    const store = createScrollPositionStore();
    expect(() => store.set('entry', '/', { page: { left: 0, top: 10 } })).not.toThrow();
    expect(store.get('entry', '/')?.page.top).toBe(10);
  },
);

it('validates stored coordinates and does not treat object prototype keys as entries', () => {
  sessionStorage.setItem(
    SCROLL_STORAGE_KEY,
    JSON.stringify([
      {
        key: '__proto__',
        url: '/',
        positions: {
          valid: { left: 0, top: 40 },
          negative: { left: 0, top: -1 },
          text: { left: 0, top: '70' },
          empty: null,
        },
      },
      { key: 1, url: '/', positions: {} },
    ]),
  );
  const store = createScrollPositionStore();
  expect(store.get('__proto__', '/')).toEqual({ valid: { left: 0, top: 40 } });
  expect(store.get('toString', '/')).toBeUndefined();
});

it('continues working in memory when session storage reads and writes throw', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('full');
  });
  const store = createScrollPositionStore();
  expect(() => store.set('entry', '/', { page: { left: 0, top: 80 } })).not.toThrow();
  expect(store.get('entry', '/')?.page.top).toBe(80);
});

it('retains every history entry throughout a long session without arbitrary eviction', () => {
  const store = createScrollPositionStore();
  for (let i = 0; i < 250; i++) store.set(`${i}`, '/', { page: { left: 0, top: i + 10 } });
  store.set('0', '/', { page: { left: 0, top: 500 } });
  store.set('new', '/', {});
  expect(store.get('1', '/')?.page.top).toBe(11);
  expect(store.get('0', '/')?.page.top).toBe(500);
  expect(JSON.parse(sessionStorage.getItem(SCROLL_STORAGE_KEY)!)).toHaveLength(251);
  const reloaded = createScrollPositionStore();
  expect(reloaded.get('1', '/')?.page.top).toBe(11);
  expect(reloaded.get('249', '/')?.page.top).toBe(259);
});
