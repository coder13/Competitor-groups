import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { trackCompetitionEvent } from '@/lib/analytics';
import { useAuth } from '@/providers/AuthProvider';
import { useCompetitionAnalytics } from './useCompetitionAnalytics';

jest.mock('@/lib/analytics', () => ({
  trackCompetitionEvent: jest.fn(),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../usePageActivityTracking', () => ({
  usePageActivityTracking: jest.fn(),
}));

const wrapper = (initialEntry: string) => {
  function TestWrapper({ children }: PropsWithChildren) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
  }

  return TestWrapper;
};

describe('useCompetitionAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      user: null,
    } as unknown as ReturnType<typeof useAuth>);
  });

  it('tracks competition views with stable labels for every competition route', () => {
    renderHook(() => useCompetitionAnalytics('ExampleComp2026'), {
      wrapper: wrapper('/competitions/ExampleComp2026/events/333-r1/2'),
    });

    expect(trackCompetitionEvent).toHaveBeenCalledWith('competition_viewed', {
      competition_id: 'ExampleComp2026',
      page: 'event_group',
      user_id: undefined,
    });
  });

  it('keeps feature-specific events for known competition pages', () => {
    renderHook(() => useCompetitionAnalytics('ExampleComp2026'), {
      wrapper: wrapper('/competitions/ExampleComp2026/admin/remote'),
    });

    expect(trackCompetitionEvent).toHaveBeenCalledWith('live_activities_opened', {
      competition_id: 'ExampleComp2026',
      page: 'live_activities',
      feature: 'live_activities',
      user_id: undefined,
    });
  });

  it.each([
    ['/competitions/ExampleComp2026/activities', 'schedule'],
    ['/competitions/ExampleComp2026/activities/1', 'schedule_activity'],
    ['/competitions/ExampleComp2026/rooms', 'schedule_rooms'],
    ['/competitions/ExampleComp2026/rooms/main', 'schedule_room'],
  ])('tracks schedule views for %s', (initialEntry, page) => {
    renderHook(() => useCompetitionAnalytics('ExampleComp2026'), {
      wrapper: wrapper(initialEntry),
    });

    expect(trackCompetitionEvent).toHaveBeenCalledWith('schedule_viewed', {
      competition_id: 'ExampleComp2026',
      page,
      feature: undefined,
      user_id: undefined,
    });
  });
});
