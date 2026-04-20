import { Competition, Round } from '@wca/helpers';

const cloneCompetition = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const makeChildActivity = (
  id: number,
  activityCode: string,
  name: string,
  startTime: string,
  endTime: string,
  extensions: { id: string; data: Record<string, unknown> }[] = [],
) => ({
  id,
  activityCode,
  name,
  startTime,
  endTime,
  childActivities: [],
  extensions,
  scrambleSetId: null,
});

const mainRoomActivities = [
  {
    id: 100,
    activityCode: '333-r1',
    name: '3x3x3 Cube, Round 1',
    startTime: '2026-05-03T16:00:00Z',
    endTime: '2026-05-03T17:30:00Z',
    childActivities: [
      makeChildActivity(
        101,
        '333-r1-g1',
        '3x3x3 Cube, Round 1, Group 1',
        '2026-05-03T16:00:00Z',
        '2026-05-03T16:45:00Z',
        [{ id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 1 } }],
      ),
      makeChildActivity(
        102,
        '333-r1-g2',
        '3x3x3 Cube, Round 1, Group 2',
        '2026-05-03T16:45:00Z',
        '2026-05-03T17:30:00Z',
        [{ id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 1 } }],
      ),
    ],
    extensions: [],
    scrambleSetId: null,
  },
  {
    id: 110,
    activityCode: '333-r2',
    name: '3x3x3 Cube, Round 2',
    startTime: '2026-05-04T17:00:00Z',
    endTime: '2026-05-04T18:00:00Z',
    childActivities: [
      makeChildActivity(
        111,
        '333-r2-g1',
        '3x3x3 Cube, Round 2, Group 1',
        '2026-05-04T17:00:00Z',
        '2026-05-04T17:30:00Z',
        [
          { id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 1 } },
          {
            id: 'groupifier.ActivityConfig',
            data: {
              featuredCompetitorWcaUserIds: [1001, 1003],
            },
          },
        ],
      ),
      makeChildActivity(
        112,
        '333-r2-g2',
        '3x3x3 Cube, Round 2, Group 2',
        '2026-05-04T17:30:00Z',
        '2026-05-04T18:00:00Z',
        [{ id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 1 } }],
      ),
    ],
    extensions: [],
    scrambleSetId: null,
  },
  {
    id: 120,
    activityCode: '333-r3',
    name: '3x3x3 Cube, Round 3',
    startTime: '2026-05-04T19:00:00Z',
    endTime: '2026-05-04T20:00:00Z',
    childActivities: [
      makeChildActivity(
        121,
        '333-r3-g1',
        '3x3x3 Cube, Round 3, Group 1',
        '2026-05-04T19:00:00Z',
        '2026-05-04T19:30:00Z',
        [{ id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 1 } }],
      ),
      makeChildActivity(
        122,
        '333-r3-g2',
        '3x3x3 Cube, Round 3, Group 2',
        '2026-05-04T19:30:00Z',
        '2026-05-04T20:00:00Z',
        [{ id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 1 } }],
      ),
    ],
    extensions: [],
    scrambleSetId: null,
  },
  {
    id: 130,
    activityCode: '222-r1',
    name: '2x2x2 Cube, Round 1',
    startTime: '2026-05-03T18:00:00Z',
    endTime: '2026-05-03T19:00:00Z',
    childActivities: [
      makeChildActivity(
        131,
        '222-r1-g1',
        '2x2x2 Cube, Round 1, Group 1',
        '2026-05-03T18:00:00Z',
        '2026-05-03T18:30:00Z',
        [{ id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 1 } }],
      ),
      makeChildActivity(
        132,
        '222-r1-g2',
        '2x2x2 Cube, Round 1, Group 2',
        '2026-05-03T18:30:00Z',
        '2026-05-03T19:00:00Z',
        [{ id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 1 } }],
      ),
    ],
    extensions: [],
    scrambleSetId: null,
  },
];

const sideRoomActivities = [
  {
    id: 200,
    activityCode: '333-r1',
    name: '3x3x3 Cube, Round 1',
    startTime: '2026-05-03T16:00:00Z',
    endTime: '2026-05-03T17:30:00Z',
    childActivities: [
      makeChildActivity(
        201,
        '333-r1-g1',
        '3x3x3 Cube, Round 1, Group 1',
        '2026-05-03T16:00:00Z',
        '2026-05-03T16:45:00Z',
        [{ id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 2 } }],
      ),
      makeChildActivity(
        202,
        '333-r1-g2',
        '3x3x3 Cube, Round 1, Group 2',
        '2026-05-03T16:45:00Z',
        '2026-05-03T17:30:00Z',
        [{ id: 'org.cubingusa.natshelper.v1.Group', data: { stageId: 2 } }],
      ),
    ],
    extensions: [],
    scrambleSetId: null,
  },
  {
    id: 210,
    activityCode: 'other-lunch',
    name: 'Lunch',
    startTime: '2026-05-04T18:00:00Z',
    endTime: '2026-05-04T18:45:00Z',
    childActivities: [],
    extensions: [],
    scrambleSetId: null,
  },
];

const storybookPersons = [
  {
    registrantId: 1,
    name: 'Blake Thompson',
    countryIso2: 'US',
    gender: 'm',
    wcaId: '2010THOM03',
    wcaUserId: 1001,
    roles: [],
    assignments: [
      { activityId: 101, assignmentCode: 'competitor', stationNumber: 1 },
      { activityId: 102, assignmentCode: 'staff-runner', stationNumber: null },
      { activityId: 111, assignmentCode: 'staff-judge', stationNumber: 2 },
      { activityId: 121, assignmentCode: 'competitor', stationNumber: 1 },
      { activityId: 131, assignmentCode: 'competitor', stationNumber: 1 },
    ],
    personalBests: [
      {
        eventId: '333',
        type: 'single',
        best: 652,
        worldRanking: 1820,
        continentalRanking: 710,
        nationalRanking: 215,
      },
      {
        eventId: '333',
        type: 'average',
        best: 841,
        worldRanking: 2410,
        continentalRanking: 980,
        nationalRanking: 301,
      },
      {
        eventId: '222',
        type: 'single',
        best: 187,
        worldRanking: 930,
        continentalRanking: 302,
        nationalRanking: 88,
      },
      {
        eventId: '222',
        type: 'average',
        best: 259,
        worldRanking: 1180,
        continentalRanking: 415,
        nationalRanking: 120,
      },
    ],
    extensions: [],
    avatar: {
      url: 'https://avatars.worldcubeassociation.org/uploads/user/avatar/2010THOM03/1526357179.jpeg',
      thumbUrl:
        'https://avatars.worldcubeassociation.org/uploads/user/avatar/2010THOM03/1526357179_thumb.jpeg',
    },
    registration: {
      status: 'accepted',
      isCompeting: true,
      eventIds: ['333', '222'],
    },
  },
  {
    registrantId: 2,
    name: 'Nick Silvestri',
    countryIso2: 'US',
    gender: 'm',
    wcaId: '2016SILV08',
    wcaUserId: 1002,
    roles: [],
    assignments: [
      { activityId: 102, assignmentCode: 'competitor', stationNumber: 2 },
      { activityId: 101, assignmentCode: 'staff-judge', stationNumber: 1 },
      { activityId: 111, assignmentCode: 'staff-scrambler', stationNumber: null },
      { activityId: 132, assignmentCode: 'staff-scrambler', stationNumber: null },
    ],
    personalBests: [
      {
        eventId: '333',
        type: 'single',
        best: 701,
        worldRanking: 2140,
        continentalRanking: 880,
        nationalRanking: 142,
      },
      {
        eventId: '333',
        type: 'average',
        best: 910,
        worldRanking: 2890,
        continentalRanking: 1240,
        nationalRanking: 201,
      },
      {
        eventId: '222',
        type: 'single',
        best: 244,
        worldRanking: 1520,
        continentalRanking: 611,
        nationalRanking: 102,
      },
    ],
    extensions: [],
    avatar: {
      url: 'https://avatars.worldcubeassociation.org/nsg38gkpoch8xiji3hodmrs672m4',
      thumbUrl: 'https://avatars.worldcubeassociation.org/uge6fzvlpmz6c8ztn8ey5wi4i8uf',
    },
    registration: {
      status: 'accepted',
      isCompeting: true,
      eventIds: ['333', '222'],
    },
  },
  {
    registrantId: 3,
    name: 'Abdullah Gulab',
    countryIso2: 'PK',
    gender: 'm',
    wcaId: '2014GULA02',
    wcaUserId: 1003,
    roles: [],
    assignments: [
      { activityId: 201, assignmentCode: 'competitor', stationNumber: 3 },
      { activityId: 202, assignmentCode: 'staff-judge', stationNumber: 3 },
      { activityId: 121, assignmentCode: 'competitor', stationNumber: 2 },
      { activityId: 122, assignmentCode: 'staff-runner', stationNumber: null },
    ],
    personalBests: [
      {
        eventId: '333',
        type: 'single',
        best: 598,
        worldRanking: 1210,
        continentalRanking: 420,
        nationalRanking: 58,
      },
      {
        eventId: '333',
        type: 'average',
        best: 801,
        worldRanking: 2010,
        continentalRanking: 740,
        nationalRanking: 102,
      },
    ],
    extensions: [],
    avatar: {
      url: 'https://avatars.worldcubeassociation.org/uploads/user/avatar/2014GULA02/1649125122.jpg',
      thumbUrl:
        'https://avatars.worldcubeassociation.org/uploads/user/avatar/2014GULA02/1649125122_thumb.jpg',
    },
    registration: {
      status: 'accepted',
      isCompeting: true,
      eventIds: ['333'],
    },
  },
  {
    registrantId: 4,
    name: 'Diego Kim',
    countryIso2: 'MX',
    gender: 'm',
    wcaId: '2026KIMD04',
    wcaUserId: 1004,
    roles: [],
    assignments: [
      { activityId: 201, assignmentCode: 'staff-runner', stationNumber: null },
      { activityId: 202, assignmentCode: 'competitor', stationNumber: 4 },
      { activityId: 131, assignmentCode: 'staff-scrambler', stationNumber: null },
      { activityId: 112, assignmentCode: 'competitor', stationNumber: 5 },
    ],
    personalBests: [
      {
        eventId: '333',
        type: 'single',
        best: 845,
        worldRanking: 3880,
        continentalRanking: 1640,
        nationalRanking: 244,
      },
    ],
    extensions: [],
    registration: {
      status: 'accepted',
      isCompeting: true,
      eventIds: ['333', '222'],
    },
  },
  {
    registrantId: 5,
    name: 'Eva Park',
    countryIso2: 'AU',
    gender: 'f',
    wcaId: '2026PARK05',
    wcaUserId: 1005,
    roles: [],
    assignments: [
      { activityId: 111, assignmentCode: 'competitor', stationNumber: 4 },
      { activityId: 112, assignmentCode: 'staff-judge', stationNumber: 5 },
      { activityId: 121, assignmentCode: 'staff-runner', stationNumber: null },
      { activityId: 122, assignmentCode: 'competitor', stationNumber: 6 },
    ],
    personalBests: [
      {
        eventId: '333',
        type: 'single',
        best: 630,
        worldRanking: 1490,
        continentalRanking: 88,
        nationalRanking: 21,
      },
      {
        eventId: '333',
        type: 'average',
        best: 830,
        worldRanking: 2280,
        continentalRanking: 131,
        nationalRanking: 34,
      },
    ],
    extensions: [],
    registration: {
      status: 'accepted',
      isCompeting: true,
      eventIds: ['333'],
    },
  },
  {
    registrantId: 6,
    name: 'Nick Silvestri',
    countryIso2: 'US',
    gender: 'm',
    wcaId: '2016SILV08',
    wcaUserId: 9001,
    roles: ['organizer', 'delegate'],
    assignments: [
      { activityId: 102, assignmentCode: 'staff-judge', stationNumber: null },
      { activityId: 111, assignmentCode: 'staff-delegate', stationNumber: null },
    ],
    personalBests: [],
    avatar: {
      url: 'https://avatars.worldcubeassociation.org/nsg38gkpoch8xiji3hodmrs672m4',
      thumbUrl: 'https://avatars.worldcubeassociation.org/uge6fzvlpmz6c8ztn8ey5wi4i8uf',
    },
    registration: {
      status: 'accepted',
      isCompeting: false,
      eventIds: [],
    },
    extensions: [
      {
        id: 'com.competitiongroups.worldsassignments',
        data: {
          assignments: [
            {
              staff: 'staff-lunch',
              startTime: '2026-05-04T18:00:00Z',
              endTime: '2026-05-04T18:45:00Z',
            },
          ],
        },
      },
    ],
  },
];

export const storybookCompetitionFixture = {
  formatVersion: '1.1',
  id: 'SeattleSummerOpen2026',
  name: 'Seattle Summer Open 2026',
  shortName: 'Seattle Summer Open 2026',
  persons: storybookPersons,
  competitorLimit: 120,
  extensions: [],
  registrationInfo: {
    openTime: '2026-02-01T00:00:00Z',
    closeTime: '2026-04-20T00:00:00Z',
    baseEntryFee: 3000,
    currencyCode: 'USD',
    onTheSpotRegistration: false,
    useWcaRegistration: true,
  },
  events: [
    {
      id: '333',
      rounds: [
        {
          id: '333-r1',
          format: 'a',
          timeLimit: null,
          cutoff: null,
          advancementCondition: {
            type: 'ranking',
            level: 24,
          },
          results: [
            { personId: 3, ranking: 1, best: 598, average: 801, attempts: [] },
            { personId: 1, ranking: 2, best: 652, average: 841, attempts: [] },
            { personId: 5, ranking: 3, best: 630, average: 830, attempts: [] },
            { personId: 2, ranking: 4, best: 701, average: 910, attempts: [] },
          ],
          scrambleSetCount: 1,
          scrambleSets: [],
          extensions: [],
        },
        {
          id: '333-r2',
          format: 'a',
          timeLimit: null,
          cutoff: null,
          advancementCondition: {
            type: 'ranking',
            level: 12,
          },
          results: [
            { personId: 1, ranking: 1, best: 640, average: 820, attempts: [] },
            { personId: 3, ranking: 2, best: 610, average: 828, attempts: [] },
            { personId: 5, ranking: 3, best: 655, average: 844, attempts: [] },
          ],
          scrambleSetCount: 1,
          scrambleSets: [],
          extensions: [],
        },
        {
          id: '333-r3',
          format: 'a',
          timeLimit: null,
          cutoff: null,
          advancementCondition: {
            type: 'percent',
            level: 50,
          },
          results: [],
          scrambleSetCount: 1,
          scrambleSets: [],
          extensions: [],
        },
      ],
      competitorLimit: null,
      qualification: null,
      extensions: [],
    },
    {
      id: '222',
      rounds: [
        {
          id: '222-r1',
          format: 'a',
          timeLimit: {
            centiseconds: 3000,
            cumulativeRoundIds: [],
          },
          cutoff: {
            numberOfAttempts: 2,
            attemptResult: 1200,
          },
          advancementCondition: {
            type: 'ranking',
            level: 16,
          },
          results: [
            { personId: 1, ranking: 1, best: 187, average: 259, attempts: [] },
            { personId: 2, ranking: 2, best: 244, average: 0, attempts: [] },
          ],
          scrambleSetCount: 1,
          scrambleSets: [],
          extensions: [],
        },
      ],
      competitorLimit: null,
      qualification: null,
      extensions: [],
    },
  ],
  schedule: {
    numberOfDays: 2,
    startDate: '2026-05-03',
    venues: [
      {
        id: 1,
        name: 'Seattle Center',
        latitudeMicrodegrees: 0,
        longitudeMicrodegrees: 0,
        countryIso2: 'US',
        timezone: 'America/Los_Angeles',
        rooms: [
          {
            id: 10,
            name: 'Main Stage',
            color: '#3b82f6',
            activities: mainRoomActivities,
            extensions: [
              {
                id: 'org.cubingusa.natshelper.v1.Room',
                data: {
                  stages: [
                    { id: 1, name: 'Blue Stage', color: '#3b82f6' },
                    { id: 2, name: 'Green Stage', color: '#10b981' },
                  ],
                },
              },
            ],
          },
          {
            id: 11,
            name: 'Side Stage',
            color: '#10b981',
            activities: sideRoomActivities,
            extensions: [
              {
                id: 'org.cubingusa.natshelper.v1.Room',
                data: {
                  stages: [
                    { id: 1, name: 'Blue Stage', color: '#3b82f6' },
                    { id: 2, name: 'Green Stage', color: '#10b981' },
                  ],
                },
              },
            ],
          },
        ],
        extensions: [],
      },
    ],
  },
} as unknown as Competition;

export const storybookCompetitionApiFixture: ApiCompetition = {
  id: 'SeattleSummerOpen2026',
  name: 'Seattle Summer Open 2026',
  short_name: 'Seattle Summer Open 2026',
  city: 'Seattle, Washington',
  country_iso2: 'US',
  start_date: '2026-05-03',
  end_date: '2026-05-04',
  announced_at: '2026-01-15T00:00:00Z',
  cancelled_at: '',
  latitude_degrees: 47.6205,
  longitude_degrees: -122.3493,
  venue_address: '305 Harrison St',
  venue_details: 'Main hall entrance is on the east side of the venue near Fisher Pavilion.',
  website: 'https://www.worldcubeassociation.org/competitions/SeattleSummerOpen2026',
  event_ids: ['333', '222'],
  organizers: [
    {
      id: 1001,
      name: 'Blake Thompson',
      email: '',
      wca_id: '2010THOM03',
      avatar: {
        thumb_url:
          'https://avatars.worldcubeassociation.org/uploads/user/avatar/2010THOM03/1526357179_thumb.jpeg',
      },
      delegate_status: 'delegate',
    },
  ],
  delegates: [
    {
      id: 1002,
      name: 'Nick Silvestri',
      email: '',
      wca_id: '2016SILV08',
      avatar: {
        thumb_url: 'https://avatars.worldcubeassociation.org/uge6fzvlpmz6c8ztn8ey5wi4i8uf',
      },
      delegate_status: 'delegate',
    },
    {
      id: 1003,
      name: 'Abdullah Gulab',
      email: '',
      wca_id: '2014GULA02',
      avatar: {
        thumb_url:
          'https://avatars.worldcubeassociation.org/uploads/user/avatar/2014GULA02/1649125122_thumb.jpg',
      },
      delegate_status: 'delegate',
    },
  ],
};

export const storybookCurrentUser: User = {
  id: 1001,
  name: 'Blake Thompson',
  email: '',
  wca_id: '2010THOM03',
  avatar: {
    url: 'https://avatars.worldcubeassociation.org/uploads/user/avatar/2010THOM03/1526357179.jpeg',
    thumb_url:
      'https://avatars.worldcubeassociation.org/uploads/user/avatar/2010THOM03/1526357179_thumb.jpeg',
  },
  delegate_status: 'delegate',
};

export const storybookOngoingActivitiesFixture = [
  {
    activityId: 101,
    startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    endTime: null,
  },
];

export const makeStorybookEventCompetitionFixture = (eventId: string): Competition => {
  const competition = cloneCompetition(storybookCompetitionFixture);
  competition.events = competition.events.filter((event) => event.id === eventId);
  competition.persons = competition.persons
    .map((person) => ({
      ...person,
      assignments: person.assignments?.filter((assignment) =>
        [...mainRoomActivities, ...sideRoomActivities]
          .flatMap((activity) => [activity, ...activity.childActivities])
          .filter((activity) => activity.activityCode.startsWith(eventId))
          .some((activity) => activity.id === assignment.activityId),
      ),
      registration: person.registration
        ? {
            ...person.registration,
            eventIds: person.registration.eventIds.filter((id) => id === eventId),
          }
        : person.registration,
      personalBests: person.personalBests?.filter((pb) => pb.eventId === eventId) || [],
    }))
    .filter((person) => (person.assignments?.length || 0) > 0 || person.roles?.length);
  return competition;
};

export const getStorybookRoundFixture = (roundId: string): Round => {
  const round = storybookCompetitionFixture.events
    .flatMap((event) => event.rounds)
    .find((candidate) => candidate.id === roundId);

  if (!round) {
    throw new Error(`Round fixture not found for "${roundId}"`);
  }

  return cloneCompetition(round);
};

export const makeStorybookCompetitionFixtureWithRound = (
  roundId: string,
  updateRound: (round: Round) => Round,
): Competition => {
  const competition = cloneCompetition(storybookCompetitionFixture);

  competition.events = competition.events.map((event) => ({
    ...event,
    rounds: event.rounds.map((round) => (round.id === roundId ? updateRound(round) : round)),
  }));

  return competition;
};

export const makeStorybookCompetitionFixtureWithRoundUpdates = (
  updates: Record<string, (round: Round) => Round>,
): Competition => {
  const competition = cloneCompetition(storybookCompetitionFixture);

  competition.events = competition.events.map((event) => ({
    ...event,
    rounds: event.rounds.map((round) => updates[round.id]?.(round) ?? round),
  }));

  return competition;
};

export const storybookParticipationConditionPercentFixture =
  makeStorybookCompetitionFixtureWithRoundUpdates({
    '333-r1': (round) => ({
      ...round,
      advancementCondition: null,
    }),
    '333-r2': (round) => ({
      ...round,
      advancementCondition: null,
      participationRuleset: {
        participationSource: {
          type: 'round',
          roundId: '333-r1',
          resultCondition: {
            type: 'percent',
            value: 75,
          },
        },
      },
    }),
  });

export const storybookParticipationConditionLinkedRoundsFixture =
  makeStorybookCompetitionFixtureWithRoundUpdates({
    '333-r2': (round) => ({
      ...round,
      advancementCondition: null,
    }),
    '333-r3': (round) => ({
      ...round,
      advancementCondition: null,
      participationRuleset: {
        participationSource: {
          type: 'linkedRounds',
          roundIds: ['333-r1', '333-r2'],
          resultCondition: {
            type: 'ranking',
            value: 12,
          },
        },
      },
    }),
  });
