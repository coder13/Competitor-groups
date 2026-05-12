import { RemoteActivityGroup } from '@/lib/notifyCompRemoteActivities';
import {
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

  it('fills progress based on live start time and next scheduled start time', () => {
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
        nextGroup: group({
          id: '222-r1-g1',
          name: '2x2x2 Cube, Round 1, Group 1',
          scheduledActivities: [
            {
              ...group({}).scheduledActivities[0],
              id: 102,
              startTime: '2026-06-01T10:20:00Z',
            },
          ],
        }),
        now: new Date('2026-06-01T10:05:00Z'),
      }),
    ).toBe(25);
  });
});
