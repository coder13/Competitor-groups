import {
  clearNotifyCompRemoteToken,
  getNotifyCompRemoteClaims,
  hasNotifyCompRemoteToken,
  setNotifyCompRemoteToken,
} from './notifyCompRemoteAuth';

jest.mock('./localStorage', () => ({
  deleteLocalStorage: (key: string) => localStorage.removeItem(key),
  getLocalStorage: (key: string) => localStorage.getItem(key),
  setLocalStorage: (key: string, value: string) => localStorage.setItem(key, value),
}));

const base64Url = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url').replace(/=/g, '');

const jwtWithClaims = (claims: Record<string, unknown>) =>
  `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(claims)}.signature`;

describe('notifyCompRemoteAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    clearNotifyCompRemoteToken();
  });

  it('reads an unpadded remote JWT payload as an authenticated session', () => {
    setNotifyCompRemoteToken(
      jwtWithClaims({
        competitionIds: ['KentSpring2026'],
        exp: Math.floor(Date.now() / 1000) + 60,
        name: 'Test Delegate',
      }),
    );

    expect(getNotifyCompRemoteClaims()?.name).toBe('Test Delegate');
    expect(hasNotifyCompRemoteToken()).toBe(true);
  });

  it('clears expired remote JWT payloads', () => {
    setNotifyCompRemoteToken(
      jwtWithClaims({
        exp: Math.floor(Date.now() / 1000) - 60,
      }),
    );

    expect(hasNotifyCompRemoteToken()).toBe(false);
  });
});
