import { RemoteActivityGroup } from '@/lib/notifyCompRemoteActivities';
import {
  formatElapsedDuration,
  formatElapsedMMSS,
  formatNextActivityOffset,
  getRemoteBarProgress,
} from './remoteBarProgress';

const group = (overrides: Partial<RemoteActivityGroup>): RemoteActivityGroup => ({
  id: '333-r1-g1',
  liveActivities: [],
  name: '3x3x3 Cube, Round 1, Group 1',
  scheduledActivities: [
    {
      activityCode: '333-r1-g1',
      childActivities: [],
      endTime: '2026-06-01T10:10:00Z',
      extensions: [],
      id: 101,
      name: '3x3x3 Cube, Round 1, Group 1',
      room: {
        id: 1,
        name: 'Stage 1',
      } as RemoteActivityGroup['scheduledActivities'][number]['room'],
      startTime: '2026-06-01T10:00:00Z',
    },
  ],
  status: 'next',
  ...overrides,
});

describe('remoteBarProgress', () => {
  it('formats elapsed live activity time as MM:SS', () => {
    expect(formatElapsedMMSS('2026-06-01T10:01:05Z', new Date('2026-06-01T10:06:09Z'))).toBe(
      '05:04',
    );
  });

  it('formats elapsed time against scheduled activity duration', () => {
    expect(
      formatElapsedDuration(
        [
          group({
            liveActivities: [
              {
                activityId: 101,
                endTime: null,
                startTime: '2026-06-01T10:01:05Z',
              },
            ],
            status: 'current',
          }),
        ],
        new Date('2026-06-01T10:06:09Z'),
      ),
    ).toBe('05:04 / 10 minutes');
  });

  it('describes how many minutes remain until the next activity', () => {
    expect(
      formatNextActivityOffset(
        group({
          name: 'Clock, Round 1, Group 1',
          scheduledActivities: [
            {
              ...group({}).scheduledActivities[0],
              startTime: '2026-06-01T10:14:15Z',
            },
          ],
        }),
        new Date('2026-06-01T10:10:00Z'),
      ),
    ).toBe('In 5 minutes');
  });

  it('describes how many minutes late the next activity is', () => {
    expect(
      formatNextActivityOffset(
        group({
          scheduledActivities: [
            {
              ...group({}).scheduledActivities[0],
              startTime: '2026-06-01T10:05:00Z',
            },
          ],
        }),
        new Date('2026-06-01T10:10:00Z'),
      ),
    ).toBe('5 minutes ago');
  });

  it('describes far future activity starts in hours', () => {
    expect(
      formatNextActivityOffset(
        group({
          scheduledActivities: [
            {
              ...group({}).scheduledActivities[0],
              startTime: '2026-06-01T13:45:00Z',
            },
          ],
        }),
        new Date('2026-06-01T10:10:00Z'),
      ),
    ).toBe('In 4 hours');
  });

  it('fills progress based on live start time and scheduled activity duration', () => {
    expect(
      getRemoteBarProgress({
        activeGroups: [
          group({
            liveActivities: [
              {
                activityId: 101,
                endTime: null,
                startTime: '2026-06-01T10:00:00Z',
              },
            ],
            status: 'current',
          }),
        ],
        now: new Date('2026-06-01T10:05:00Z'),
      }),
    ).toEqual({
      percent: 50,
      tone: 'normal',
    });
  });

  it('uses a warning tone once the activity is within 5 percent of done', () => {
    expect(
      getRemoteBarProgress({
        activeGroups: [
          group({
            liveActivities: [
              {
                activityId: 101,
                endTime: null,
                startTime: '2026-06-01T10:00:00Z',
              },
            ],
            status: 'current',
          }),
        ],
        now: new Date('2026-06-01T10:09:30Z'),
      }),
    ).toEqual({
      percent: 95,
      tone: 'warning',
    });
  });

  it('uses an overdue tone once the scheduled duration has elapsed', () => {
    expect(
      getRemoteBarProgress({
        activeGroups: [
          group({
            liveActivities: [
              {
                activityId: 101,
                endTime: null,
                startTime: '2026-06-01T10:00:00Z',
              },
            ],
            status: 'current',
          }),
        ],
        now: new Date('2026-06-01T10:11:00Z'),
      }),
    ).toEqual({
      percent: 100,
      tone: 'overdue',
    });
  });
});
