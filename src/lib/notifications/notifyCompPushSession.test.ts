import {
  clearNotifyCompPushSessionToken,
  getNotifyCompPushSessionToken,
  setNotifyCompPushSessionToken,
} from './notifyCompPushSession';

jest.mock('@/lib/localStorage', () => ({
  deleteLocalStorage: (key: string) => localStorage.removeItem(key),
  getLocalStorage: (key: string) => localStorage.getItem(key),
  setLocalStorage: (key: string, value: string) => localStorage.setItem(key, value),
}));

const base64Url = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url').replace(/=/g, '');

const jwtWithClaims = (claims: Record<string, unknown>) =>
  `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(claims)}.signature`;

describe('notifyCompPushSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    clearNotifyCompPushSessionToken();
  });

  it('stores opaque NotifyComp push session tokens', () => {
    setNotifyCompPushSessionToken('opaque-session-token');

    expect(getNotifyCompPushSessionToken()).toBe('opaque-session-token');
  });

  it('reads unpadded JWT push session tokens', () => {
    const token = jwtWithClaims({
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    setNotifyCompPushSessionToken(token);

    expect(getNotifyCompPushSessionToken()).toBe(token);
  });

  it('clears expired JWT push session tokens', () => {
    setNotifyCompPushSessionToken(
      jwtWithClaims({
        exp: Math.floor(Date.now() / 1000) - 60,
      }),
    );

    expect(getNotifyCompPushSessionToken()).toBe(null);
  });
});
