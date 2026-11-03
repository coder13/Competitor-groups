import { renderHook } from '@testing-library/react';
import { Competition } from '@wca/helpers';
import { getAllActivities } from '@/lib/activities';
import { useWCIF } from '@/providers/WCIFProvider';
import { ActivitiesSubscriptionDocument, useActivitiesQuery } from '@/queries';
import { useOngoingActivities } from './useOngoingActivities';

jest.mock('@/lib/activities', () => ({ getAllActivities: jest.fn() }));
jest.mock('@/providers/WCIFProvider', () => ({ useWCIF: jest.fn() }));
jest.mock('@/queries', () => ({
  ActivitiesSubscriptionDocument: 'ActivitiesSubscriptionDocument',
  useActivitiesQuery: jest.fn(),
}));

const unsubscribe = jest.fn();
const subscribeToMore = jest.fn((_options: unknown) => unsubscribe);
const setWCIF = (id?: string) => {
  jest.mocked(useWCIF).mockReturnValue({
    competitionId: id || '',
    wcif: id ? ({ id } as Competition) : undefined,
    setTitle: jest.fn(),
  });
};

describe('useOngoingActivities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setWCIF();
    jest.mocked(getAllActivities).mockReturnValue([]);
    jest.mocked(useActivitiesQuery).mockReturnValue({
      data: { activities: [] },
      subscribeToMore,
    } as unknown as ReturnType<typeof useActivitiesQuery>);
  });

  it('does not subscribe with an undefined competition while WCIF is loading or missing', () => {
    renderHook(() => useOngoingActivities('MissingCompetition2026'));

    expect(useActivitiesQuery).toHaveBeenCalledWith('');
    expect(subscribeToMore).not.toHaveBeenCalled();
  });

  it('subscribes when the requested competition loads and cleans up on unmount', () => {
    const { rerender, unmount } = renderHook(() => useOngoingActivities('Example2026'));

    setWCIF('Example2026');
    rerender();

    expect(useActivitiesQuery).toHaveBeenLastCalledWith('Example2026');
    expect(subscribeToMore).toHaveBeenCalledWith(
      expect.objectContaining({
        document: ActivitiesSubscriptionDocument,
        variables: { competitionIds: ['Example2026'] },
      }),
    );
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('does not recreate the subscription when the same WCIF is refreshed', () => {
    setWCIF('Example2026');
    const { rerender } = renderHook(() => useOngoingActivities('Example2026'));

    setWCIF('Example2026');
    rerender();

    expect(subscribeToMore).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it('stops the old subscription while a different competition loads', () => {
    setWCIF('First2026');
    const { rerender } = renderHook(({ id }) => useOngoingActivities(id), {
      initialProps: { id: 'First2026' },
    });

    rerender({ id: 'Second2026' });

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(useActivitiesQuery).toHaveBeenLastCalledWith('');
    expect(subscribeToMore).toHaveBeenCalledTimes(1);

    setWCIF('Second2026');
    rerender({ id: 'Second2026' });

    expect(subscribeToMore).toHaveBeenLastCalledWith(
      expect.objectContaining({ variables: { competitionIds: ['Second2026'] } }),
    );
  });

  it('replaces changed live activities and preserves unrelated activities', () => {
    setWCIF('Example2026');
    renderHook(() => useOngoingActivities('Example2026'));
    const options = subscribeToMore.mock.calls[0][0] as unknown as {
      updateQuery: (previous: unknown, update: unknown) => unknown;
    };
    const otherActivity = { activityId: 2, startTime: '09:00', endTime: '' };
    const previous = {
      activities: [{ activityId: 1, startTime: '08:00', endTime: '' }, otherActivity],
    };
    const activity = { activityId: 1, startTime: '08:00', endTime: '09:00' };

    expect(options.updateQuery(previous, { subscriptionData: { data: { activity } } })).toEqual({
      activities: [otherActivity, activity],
    });
    expect(options.updateQuery(previous, { subscriptionData: {} })).toBe(previous);
  });
});
