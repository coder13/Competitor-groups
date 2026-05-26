import { startPWAUpdatePolling } from './pwaUpdatePolling';

describe('startPWAUpdatePolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('checks for updates immediately and on the polling interval while visible', () => {
    const registration = { update: jest.fn() };

    const stopPolling = startPWAUpdatePolling(registration, {
      intervalMs: 1_000,
      isVisible: () => true,
    });

    expect(registration.update).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(2_000);

    expect(registration.update).toHaveBeenCalledTimes(3);

    stopPolling();
    jest.advanceTimersByTime(1_000);

    expect(registration.update).toHaveBeenCalledTimes(3);
  });

  it('skips update checks while the tab is hidden', () => {
    const registration = { update: jest.fn() };

    startPWAUpdatePolling(registration, {
      intervalMs: 1_000,
      isVisible: () => false,
    });

    jest.advanceTimersByTime(2_000);

    expect(registration.update).not.toHaveBeenCalled();
  });
});
