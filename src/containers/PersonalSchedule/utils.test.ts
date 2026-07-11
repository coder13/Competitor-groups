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
            startTime: '2025-07-04T01:00:00Z',
            endTime: '2025-07-04T02:00:00Z',
          },
        ],
      },
    },
  ],
} as unknown as Person;

const fmcWcif = {
  ...wcif,
  schedule: {
    ...wcif.schedule,
    venues: [
      {
        ...wcif.schedule.venues[0],
        rooms: [
          {
            id: 1,
            name: 'FMC Room',
            color: '#ffffff',
            extensions: [],
            activities: [
              {
                id: 100,
                name: 'Fewest Moves Attempt 1',
                activityCode: '333fm-r1-a1',
                startTime: '2025-07-03T18:00:00Z',
                endTime: '2025-07-03T19:00:00Z',
                extensions: [],
                childActivities: [
                  {
                    id: 101,
                    name: 'Fewest Moves Attempt 1 Group 1',
                    activityCode: '333fm-r1-g1-a1',
                    startTime: '2025-07-03T18:00:00Z',
                    endTime: '2025-07-03T19:00:00Z',
                    extensions: [],
                    childActivities: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
} as unknown as Competition;

const fmcPerson = {
  registrantId: 216,
  assignments: [
    {
      activityId: 101,
      assignmentCode: 'competitor',
      stationNumber: null,
    },
  ],
  registration: {
    eventIds: ['333fm'],
  },
  extensions: [],
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

  it('keeps standard other activities in the other namespace', () => {
    expect(parseActivityCodeFlexible('other-lunch-g2')).toMatchObject({
      eventId: 'other-lunch',
      roundNumber: 1,
      groupNumber: 2,
      attemptNumber: null,
    });
    expect(parseActivityCodeFlexible('other-misc')).toMatchObject({
      eventId: 'other-misc',
    });
  });

  it('only includes the FMC attempt activity assigned to the competitor', () => {
    const fmcAssignments = getAllAssignments(fmcWcif, fmcPerson).filter(({ activity }) =>
      activity?.activityCode.startsWith('333fm'),
    );

    expect(fmcAssignments).toHaveLength(1);
    expect(fmcAssignments[0].activityId).toBe(101);
  });

  it('does not create FMC assignments without a matching activity assignment', () => {
    const personWithoutFmcAssignment = {
      ...fmcPerson,
      assignments: [],
    } as Person;

    expect(getAllAssignments(fmcWcif, personWithoutFmcAssignment)).toHaveLength(0);
  });

  it('includes a day that only has an assigned FMC attempt', () => {
    const [scheduleDay] = getGroupedAssignmentsByDate(fmcWcif, fmcPerson);

    expect(scheduleDay.date).toBe('Thursday, 7/3/2025');
    expect(scheduleDay.assignments).toHaveLength(1);
    expect(scheduleDay.assignments[0].assignment.activityId).toBe(101);
  });
});
