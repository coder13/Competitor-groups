import {
  getRemoteActivityGroups,
  getRemoteActivityState,
  getRemoteNextGroup,
  getRemotePreviousGroup,
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

  it('finds the next group after the current activity group', () => {
    const groups = getRemoteActivityGroups(
      [
        activity({ id: 301, activityCode: '333-r1-g1' }),
        activity({
          id: 302,
          activityCode: '222-r1-g1',
          name: '2x2x2 Cube Round 1 Group 1',
          startTime: '2026-06-01T10:20:00Z',
        }),
      ],
      [{ activityId: 301, startTime: '2026-06-01T10:01:00Z', endTime: null }],
    );

    expect(getRemoteNextGroup(groups)?.scheduledActivities[0].id).toBe(302);
  });

  it('finds the previous group before the current activity group', () => {
    const groups = getRemoteActivityGroups(
      [
        activity({
          id: 401,
          activityCode: '222-r1-g1',
          name: '2x2x2 Cube Round 1 Group 1',
        }),
        activity({
          id: 402,
          activityCode: '333-r1-g1',
          startTime: '2026-06-01T10:20:00Z',
        }),
      ],
      [
        {
          activityId: 401,
          startTime: '2026-06-01T10:01:00Z',
          endTime: '2026-06-01T10:09:00Z',
        },
        { activityId: 402, startTime: '2026-06-01T10:21:00Z', endTime: null },
      ],
    );

    expect(getRemotePreviousGroup(groups)?.scheduledActivities[0].id).toBe(401);
  });
});
