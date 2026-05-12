import {
  getRemoteActivityGroups,
  getRemoteActivityState,
  RemoteScheduledActivity,
} from './notifyCompRemoteActivities';

const room = {
  id: 1,
  name: 'Stage 1',
} as RemoteScheduledActivity['room'];

const activity = (overrides: Partial<RemoteScheduledActivity>): RemoteScheduledActivity =>
  ({
    activityCode: '333-r1-g1',
    childActivities: [],
    endTime: '2026-06-01T10:10:00Z',
    extensions: [],
    id: 101,
    name: '3x3x3 Cube Round 1 Group 1',
    room,
    startTime: '2026-06-01T10:00:00Z',
    ...overrides,
  }) as RemoteScheduledActivity;

describe('notifyCompRemoteActivities', () => {
  it('marks an activity as next when NotifyComp has no live record', () => {
    expect(getRemoteActivityState(activity({}), []).status).toBe('next');
  });

  it('marks an activity as current when it has a start without an end', () => {
    expect(
      getRemoteActivityState(activity({ id: 102 }), [
        {
          activityId: 102,
          startTime: '2026-06-01T10:01:00Z',
          endTime: null,
        },
      ]).status,
    ).toBe('current');
  });

  it('marks an activity as done when it has an end time', () => {
    expect(
      getRemoteActivityState(activity({ id: 103 }), [
        {
          activityId: 103,
          startTime: '2026-06-01T10:01:00Z',
          endTime: '2026-06-01T10:09:00Z',
        },
      ]).status,
    ).toBe('done');
  });

  it('groups matching activity codes across rooms by round code', () => {
    const groups = getRemoteActivityGroups(
      [
        activity({ id: 201, activityCode: '333-r1-g1', room }),
        activity({
          id: 202,
          activityCode: '333-r1-g2',
          room: {
            ...room,
            id: 2,
            name: 'Stage 2',
          },
        }),
      ],
      [],
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].scheduledActivities.map((candidate) => candidate.id)).toEqual([201, 202]);
  });
});
