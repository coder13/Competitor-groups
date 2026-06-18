import { Competition, Person } from '@wca/helpers';
import { parseActivityCodeFlexible } from '@/lib/activityCodes';
import { formatBriefActivityName, getAllAssignments, getGroupedAssignmentsByDate } from './utils';

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
  },
  t: (key: string) => key,
}));

const wcif = {
  id: 'WC2025',
  schedule: {
    venues: [
      {
        id: 1,
        name: 'Venue',
        timezone: 'America/Los_Angeles',
        rooms: [],
      },
    ],
  },
  events: [],
} as unknown as Competition;

const worldsAssignmentsPerson = {
  registrantId: 215,
  assignments: [],
  registration: {
    eventIds: [],
  },
  extensions: [
    {
      id: 'com.competitiongroups.worldsassignments',
      data: {
        assignments: [
          {
            staff: 'Stage Stream - Main',
            startTime: '2025-07-03T18:00:00Z',
            endTime: '2025-07-03T19:00:00Z',
          },
        ],
      },
    },
  ],
} as unknown as Person;

describe('PersonalSchedule utils', () => {
  it('creates parse-safe activities for worlds assignments with free-form staff names', () => {
    const [assignment] = getAllAssignments(wcif, worldsAssignmentsPerson);

    expect(assignment.activity).toBeDefined();
    const activity = assignment.activity!;

    expect(activity.activityCode).toBe('other-misc');
    expect(() => parseActivityCodeFlexible(activity.activityCode)).not.toThrow();
    expect(formatBriefActivityName(activity)).toBe('Stage Stream - Main');
  });

  it('includes days that only have worlds assignments', () => {
    const [scheduleDay] = getGroupedAssignmentsByDate(wcif, worldsAssignmentsPerson);

    expect(scheduleDay.date).toBe('Thursday, 7/3/2025');
    expect(scheduleDay.assignments).toHaveLength(1);
    expect(scheduleDay.assignments[0].assignment.assignmentCode).toBe('Stage Stream - Main');
  });
});
