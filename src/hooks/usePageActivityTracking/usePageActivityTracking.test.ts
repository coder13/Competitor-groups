import { renderHook } from '@testing-library/react';
import { trackCompetitionEvent } from '@/lib/analytics';
import { usePageActivityTracking } from './usePageActivityTracking';

jest.mock('@/lib/analytics', () => ({
  trackCompetitionEvent: jest.fn(),
}));

const setVisibilityState = (visibilityState: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: visibilityState,
  });
};

describe('usePageActivityTracking', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setVisibilityState('visible');
    jest.mocked(trackCompetitionEvent).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('tracks active visible time every 60 seconds', () => {
    renderHook(() =>
      usePageActivityTracking({
        competitionId: 'ExampleComp2026',
        page: 'groups',
        userId: 123,
      }),
    );

    jest.advanceTimersByTime(59_000);
    expect(trackCompetitionEvent).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1_000);
    expect(trackCompetitionEvent).toHaveBeenCalledWith('page_active_60s', {
      competition_id: 'ExampleComp2026',
      page: 'groups',
      user_id: 123,
    });
  });

  it('does not track while hidden', () => {
    setVisibilityState('hidden');

    renderHook(() =>
      usePageActivityTracking({
        competitionId: 'ExampleComp2026',
        page: 'groups',
      }),
    );

    jest.advanceTimersByTime(60_000);

    expect(trackCompetitionEvent).not.toHaveBeenCalled();
  });

  it('clears the timer on unmount', () => {
    const { unmount } = renderHook(() =>
      usePageActivityTracking({
        competitionId: 'ExampleComp2026',
        page: 'groups',
      }),
    );

    unmount();
    jest.advanceTimersByTime(60_000);

    expect(trackCompetitionEvent).not.toHaveBeenCalled();
  });
});
