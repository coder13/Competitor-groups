import {
  clearNotifyCompRemoteToken,
  getNotifyCompRemoteClaims,
  hasNotifyCompRemoteTokenForCompetition,
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

  it('reads competitionIds from an unpadded remote JWT payload', () => {
    setNotifyCompRemoteToken(
      jwtWithClaims({
        competitionIds: ['KentSpring2026'],
        exp: Math.floor(Date.now() / 1000) + 60,
        name: 'Test Delegate',
      }),
    );

    expect(getNotifyCompRemoteClaims()?.name).toBe('Test Delegate');
    expect(hasNotifyCompRemoteTokenForCompetition('KentSpring2026')).toBe(true);
    expect(hasNotifyCompRemoteTokenForCompetition('OtherComp2026')).toBe(false);
  });

  it('accepts snake_case competition ids from remote JWT payloads', () => {
    setNotifyCompRemoteToken(
      jwtWithClaims({
        competition_ids: ['KentSpring2026'],
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    );

    expect(hasNotifyCompRemoteTokenForCompetition('KentSpring2026')).toBe(true);
  });
});
