import { getScheduleActivityGroups, getScheduleActivityPath } from './scheduleActivityGroups';

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string, options?: { groupNumber?: number; roundNumber?: number }) =>
      key === 'common.activityCodeToName.group'
        ? `Group ${options?.groupNumber}`
        : key === 'common.activityCodeToName.round'
          ? `Round ${options?.roundNumber}`
          : key,
  },
  t: (key: string, options?: { groupNumber?: number; roundNumber?: number }) =>
    key === 'common.activityCodeToName.group'
      ? `Group ${options?.groupNumber}`
      : key === 'common.activityCodeToName.round'
        ? `Round ${options?.roundNumber}`
        : key,
}));

const makeActivity = ({
  activityCode,
  id,
  name,
  room,
}: {
  activityCode: string;
  id: number;
  name: string;
  room: { color: string; id: number; name: string };
}) => ({
  activityCode,
  childActivities: [],
  endTime: '2026-06-01T10:10:00Z',
  extensions: [],
  id,
  name,
  parent: {
    activityCode: '333-r1',
    childActivities: [],
    endTime: '2026-06-01T11:00:00Z',
    extensions: [],
    id: id + 1000,
    name: '3x3x3 Cube, Round 1',
    room,
    startTime: '2026-06-01T10:00:00Z',
  },
  startTime: '2026-06-01T10:00:00Z',
});

describe('scheduleActivityGroups', () => {
  it('groups matching activity codes and keeps unique room chips', () => {
    const firstRoom = { color: '#ff0000', id: 1, name: 'Red room' };
    const secondRoom = { color: '#0000ff', id: 2, name: 'Blue room' };
    const firstActivity = makeActivity({
      activityCode: '333-r1-g1',
      id: 101,
      name: '3x3x3 Cube, Round 1, Group 1',
      room: firstRoom,
    });
    const secondActivity = makeActivity({
      activityCode: '333-r1-g1',
      id: 102,
      name: '3x3x3 Cube, Round 1, Group 1',
      room: secondRoom,
    });
    const wcif = {
      id: 'ExampleComp2026',
      schedule: {
        venues: [
          {
            rooms: [
              {
                ...firstRoom,
                activities: [{ ...firstActivity.parent, childActivities: [firstActivity] }],
              },
              {
                ...secondRoom,
                activities: [{ ...secondActivity.parent, childActivities: [secondActivity] }],
              },
            ],
            timezone: 'America/Los_Angeles',
          },
        ],
      },
    };

    const groups = getScheduleActivityGroups(
      wcif as never,
      [firstActivity, secondActivity] as never,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].activityCode).toBe('333-r1-g1');
    expect(groups[0].rooms.map((room) => room.name)).toEqual(['Red room', 'Blue room']);
    expect(groups[0].to).toBe('/competitions/ExampleComp2026/events/333-r1/1');
  });

  it('links grouped activities to the group page', () => {
    const activity = makeActivity({
      activityCode: '333-r2-g3',
      id: 201,
      name: '3x3x3 Cube, Round 2, Group 3',
      room: { color: '#ff0000', id: 1, name: 'Red room' },
    });

    expect(getScheduleActivityPath('ExampleComp2026', activity as never)).toBe(
      '/competitions/ExampleComp2026/events/333-r2/3',
    );
  });
});
