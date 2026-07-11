import { Competition, Person } from '@wca/helpers';
import { WcaLiveCompetitorResult, WcaLiveRound } from '@/hooks/queries/useWcaLive';
import { WcaCompetitionResult } from '@/lib/api';
import { findPersonForApiResult } from './resultSources';
import { getPersonalResultsFromSources, getRoundResultsFromSources } from './resultsProvider';

jest.mock('@/lib/events', () => ({
  getEventName: (eventId: string) => (eventId === '333' ? '3x3x3 Cube' : eventId),
}));

const persons: Person[] = [
  {
    registrantId: 1,
    name: 'Alice Solver',
    wcaUserId: 1001,
    wcaId: '2010ALIC01',
    countryIso2: 'US',
    registration: null,
    assignments: [{ activityId: 101, assignmentCode: 'competitor', stationNumber: 1 }],
    extensions: [],
  },
  {
    registrantId: 2,
    name: 'Bob Solver',
    wcaUserId: 1002,
    wcaId: '2010BOBS01',
    countryIso2: 'US',
    registration: null,
    assignments: [{ activityId: 101, assignmentCode: 'competitor', stationNumber: 2 }],
    extensions: [],
  },
  {
    registrantId: 3,
    name: 'Casey Solver',
    wcaUserId: 1003,
    wcaId: null,
    countryIso2: 'US',
    registration: null,
    assignments: [{ activityId: 101, assignmentCode: 'competitor', stationNumber: 3 }],
    extensions: [],
  },
];

const wcif = {
  formatVersion: '1.0',
  id: 'ProviderTest2026',
  name: 'Provider Test 2026',
  shortName: 'Provider Test',
  persons,
  competitorLimit: null,
  extensions: [],
  events: [
    {
      id: '333',
      extensions: [],
      rounds: [
        {
          id: '333-r1',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          advancementCondition: null,
          extensions: [],
          results: [
            {
              personId: 1,
              ranking: 1,
              attempts: [
                { result: 1200, reconstruction: null },
                { result: 1300, reconstruction: null },
                { result: 1400, reconstruction: null },
              ],
              best: 1200,
              average: 1300,
            },
          ],
        },
        {
          id: '333-r2',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          advancementCondition: null,
          extensions: [],
          results: [],
        },
        {
          id: '333-r3',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          advancementCondition: null,
          extensions: [],
          results: [],
        },
      ],
    },
  ],
  schedule: {
    numberOfDays: 1,
    startDate: '2026-05-03',
    venues: [
      {
        id: 1,
        name: 'Main Venue',
        latitudeMicrodegrees: 0,
        longitudeMicrodegrees: 0,
        countryIso2: 'US',
        timezone: 'America/Los_Angeles',
        rooms: [
          {
            id: 1,
            name: 'Main Room',
            color: '#ffffff',
            activities: [
              {
                id: 100,
                name: '3x3x3 Cube Round 1',
                activityCode: '333-r1',
                startTime: '2026-05-03T19:00:00Z',
                endTime: '2026-05-03T20:00:00Z',
                childActivities: [
                  {
                    id: 101,
                    name: '3x3x3 Cube Round 1 Group 1',
                    activityCode: '333-r1-g1',
                    startTime: '2026-05-03T19:00:00Z',
                    endTime: '2026-05-03T20:00:00Z',
                    childActivities: [],
                    extensions: [],
                  },
                ],
                extensions: [],
              },
            ],
            extensions: [],
          },
        ],
        extensions: [],
      },
    ],
  },
} as Competition;

const selectedRound = (roundIndex: number) => ({
  event: wcif.events[0],
  round: wcif.events[0].rounds[roundIndex],
  roundNumber: roundIndex + 1,
});

const apiResult = (overrides: Partial<WcaCompetitionResult> = {}): WcaCompetitionResult => ({
  id: 9000,
  pos: 2,
  best: 1100,
  average: 1200,
  name: 'Bob Solver',
  country_iso2: 'US',
  competition_id: wcif.id,
  event_id: '333',
  round_type_id: '2',
  format_id: 'a',
  wca_id: '2010BOBS01',
  attempts: [1100, 1200, 1300],
  ...overrides,
});

const liveRound = (results: WcaLiveRound['results']): WcaLiveRound => ({
  id: 'live-333-r1',
  format: {
    id: 'a',
    numberOfAttempts: 5,
    sortBy: 'average',
  },
  results,
});

const liveRoundResult = (
  overrides: Partial<WcaLiveRound['results'][number]> = {},
): WcaLiveRound['results'][number] => ({
  id: 'live-bob',
  ranking: 2,
  advancing: false,
  advancingQuestionable: false,
  attempts: [{ result: 1000 }, { result: 1100 }, { result: 1200 }],
  best: 1000,
  average: 1100,
  person: {
    id: '2',
    registrantId: 2,
    wcaUserId: 1002,
    wcaId: '2010BOBS01',
    name: 'Bob Solver',
  },
  ...overrides,
});

const livePersonalResult = (
  overrides: Partial<WcaLiveCompetitorResult> = {},
): WcaLiveCompetitorResult => ({
  id: 'live-personal-333-r1',
  ranking: 1,
  advancing: false,
  advancingQuestionable: false,
  attempts: [{ result: 900 }, { result: 1000 }, { result: 1100 }],
  best: 900,
  average: 1000,
  round: {
    id: 'live-round-333-r1',
    name: 'First Round',
    number: 1,
    competitionEvent: {
      id: 'live-event-333',
      event: {
        id: '333',
        name: '3x3x3 Cube',
        rank: 10,
      },
    },
    format: {
      id: 'a',
      numberOfAttempts: 5,
      sortBy: 'average',
    },
  },
  ...overrides,
});

describe('findPersonForApiResult', () => {
  const duplicateNamePerson: Person = {
    ...persons[0],
    registrantId: 4,
    wcaUserId: 1004,
    wcaId: '2010ALIC02',
  };

  it('matches an exact WCA ID before considering duplicate names', () => {
    expect(
      findPersonForApiResult(
        [...persons, duplicateNamePerson],
        apiResult({ name: 'Alice Solver', wca_id: '2010ALIC02' }),
      ),
    ).toBe(duplicateNamePerson);
  });

  it('does not fall back to a name when a WCA ID is present but unmatched', () => {
    expect(
      findPersonForApiResult(persons, apiResult({ name: 'Alice Solver', wca_id: '2099MISS01' })),
    ).toBeUndefined();
  });

  it('does not use an ambiguous name when the API result has no WCA ID', () => {
    expect(
      findPersonForApiResult(
        [...persons, duplicateNamePerson],
        apiResult({ name: 'Alice Solver', wca_id: null }),
      ),
    ).toBeUndefined();
  });
});

describe('resultsProvider', () => {
  describe('getRoundResultsFromSources', () => {
    it('returns no round results without WCIF or a selected round', () => {
      expect(
        getRoundResultsFromSources({
          wcif: undefined,
          selectedRound: selectedRound(0),
          wcaApiResults: [],
          wcaLiveRound: undefined,
        }),
      ).toEqual([]);
      expect(
        getRoundResultsFromSources({
          wcif,
          selectedRound: undefined,
          wcaApiResults: [],
          wcaLiveRound: undefined,
        }),
      ).toEqual([]);
    });

    it('uses WCA API results when WCIF has no results for a round', () => {
      const results = getRoundResultsFromSources({
        wcif,
        selectedRound: selectedRound(1),
        wcaApiResults: [apiResult()],
        wcaLiveRound: undefined,
      });

      expect(results).toMatchObject([
        {
          personId: 2,
          ranking: 2,
          best: 1100,
          average: 1200,
          attempts: [{ result: 1100 }, { result: 1200 }, { result: 1300 }],
        },
      ]);
    });

    it('prefers WCIF results over WCA API results for the same competitor', () => {
      const results = getRoundResultsFromSources({
        wcif,
        selectedRound: selectedRound(0),
        wcaApiResults: [
          apiResult({
            id: 9001,
            pos: 4,
            best: 2100,
            average: 2200,
            name: 'Alice Solver',
            round_type_id: '1',
            wca_id: '2010ALIC01',
            attempts: [2100, 2200, 2300],
          }),
        ],
        wcaLiveRound: undefined,
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        personId: 1,
        ranking: 1,
        best: 1200,
        average: 1300,
      });
    });

    it('prefers WCA Live results and includes roster rows while a round is partial', () => {
      const results = getRoundResultsFromSources({
        wcif,
        selectedRound: selectedRound(0),
        wcaApiResults: [
          apiResult({
            pos: 5,
            best: 2100,
            average: 2200,
            round_type_id: '1',
            attempts: [2100, 2200, 2300],
            best_index: 2,
            worst_index: 0,
            regional_single_record: 'NR',
            regional_average_record: 'WR',
          }),
        ],
        wcaLiveRound: liveRound([
          liveRoundResult(),
          liveRoundResult({
            id: 'live-unknown',
            person: {
              id: 'unknown',
              registrantId: null,
              name: 'Unknown Competitor',
            },
          }),
        ]),
      });

      expect(results).toHaveLength(4);
      expect(results.find((result) => result.personId === 2)).toMatchObject({
        ranking: 2,
        best: 1000,
        average: 1100,
        singleRecordTag: 'NR',
        averageRecordTag: 'WR',
      });
      expect(results.find((result) => result.personId === 2)).not.toHaveProperty(
        'bestAttemptIndex',
      );
      expect(results.find((result) => result.personId === 2)).not.toHaveProperty(
        'worstAttemptIndex',
      );
      expect(results.find((result) => result.personId === 1)).toMatchObject({
        ranking: 1,
        best: 1200,
        average: 1300,
      });
      expect(results.find((result) => result.personId === 3)).toMatchObject({
        ranking: null,
        best: 0,
        average: 0,
      });
      expect(results.find((result) => result.personId == null)).toMatchObject({
        personName: 'Unknown Competitor',
      });
    });

    it('matches live round results by WCA user id when registrant id is missing', () => {
      const results = getRoundResultsFromSources({
        wcif,
        selectedRound: selectedRound(0),
        wcaApiResults: [],
        wcaLiveRound: liveRound([
          liveRoundResult({
            id: 'live-alice',
            ranking: 4,
            best: 900,
            average: 1000,
            attempts: [{ result: 900 }, { result: 1000 }, { result: 1100 }],
            person: {
              id: 'missing-registrant-id',
              registrantId: null,
              wcaUserId: 1001,
              wcaId: '2010ALIC01',
              name: 'Alice Published Name',
            },
          }),
        ]),
      });

      expect(results).toHaveLength(3);
      expect(results.filter((result) => result.personId === 1)).toHaveLength(1);
      expect(results.find((result) => result.personId === 1)).toMatchObject({
        personName: 'Alice Published Name',
        ranking: 4,
        best: 900,
        average: 1000,
        attempts: [{ result: 900 }, { result: 1000 }, { result: 1100 }],
      });
    });

    it('leaves a live result unlinked when its name is ambiguous and identifiers are missing', () => {
      const duplicateNamePerson: Person = {
        ...persons[0],
        registrantId: 4,
        wcaUserId: 1004,
        wcaId: '2010ALIC02',
      };
      const duplicateNameWcif = {
        ...wcif,
        persons: [...persons, duplicateNamePerson],
      } as Competition;
      const results = getRoundResultsFromSources({
        wcif: duplicateNameWcif,
        selectedRound: selectedRound(0),
        wcaApiResults: [],
        wcaLiveRound: liveRound([
          liveRoundResult({
            id: 'live-ambiguous-alice',
            person: {
              id: 'missing-identifiers',
              registrantId: null,
              name: 'Alice Solver',
            },
          }),
        ]),
      });

      expect(results.find((result) => result.id === 'live-ambiguous-alice')).toMatchObject({
        personId: null,
        personName: 'Alice Solver',
      });
    });

    it('does not override an unmatched live identity with a name match', () => {
      const results = getRoundResultsFromSources({
        wcif,
        selectedRound: selectedRound(0),
        wcaApiResults: [],
        wcaLiveRound: liveRound([
          liveRoundResult({
            id: 'live-conflicting-alice',
            person: {
              id: 'conflicting-identifiers',
              registrantId: null,
              wcaUserId: 9999,
              wcaId: '2099MISS01',
              name: 'Alice Solver',
            },
          }),
        ]),
      });

      expect(results.find((result) => result.id === 'live-conflicting-alice')).toMatchObject({
        personId: null,
        personName: 'Alice Solver',
      });
    });

    it('matches WCA API results by WCA ID before using the displayed name', () => {
      const results = getRoundResultsFromSources({
        wcif,
        selectedRound: selectedRound(1),
        wcaApiResults: [
          apiResult({
            name: 'Different Published Name',
            wca_id: '2010ALIC01',
          }),
        ],
        wcaLiveRound: undefined,
      });

      expect(results[0]).toMatchObject({
        personId: 1,
        personName: 'Different Published Name',
      });
    });

    it('maps final round API result types to the final WCIF round', () => {
      const results = getRoundResultsFromSources({
        wcif,
        selectedRound: selectedRound(2),
        wcaApiResults: [
          apiResult({
            id: 9002,
            round_type_id: 'f',
          }),
        ],
        wcaLiveRound: undefined,
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        id: 9002,
        personId: 2,
      });
    });
  });

  describe('getPersonalResultsFromSources', () => {
    it('returns no personal results without WCIF', () => {
      expect(
        getPersonalResultsFromSources({
          wcif: undefined,
          person: persons[0],
          wcaApiResults: [],
          wcaLiveResults: [],
        }),
      ).toEqual([]);
    });

    it('merges personal results per round across WCA API, WCIF, and WCA Live', () => {
      const results = getPersonalResultsFromSources({
        wcif,
        person: persons[0],
        wcaApiResults: [
          apiResult({
            id: 9100,
            pos: 3,
            best: 700,
            average: 800,
            name: 'Alice Solver',
            round_type_id: '2',
            wca_id: '2010ALIC01',
            attempts: [700, 800, 900],
          }),
          apiResult({
            id: 9101,
            pos: 2,
            best: 600,
            average: 700,
            name: 'Alice Solver',
            round_type_id: 'f',
            wca_id: '2010ALIC01',
            attempts: [600, 700, 800],
          }),
        ],
        wcaLiveResults: [
          livePersonalResult({
            ranking: 4,
            best: 500,
            average: 600,
            attempts: [{ result: 500 }, { result: 600 }, { result: 700 }],
          }),
        ],
      });

      expect(results).toHaveLength(1);
      expect(results[0].rounds).toMatchObject([
        {
          roundId: '333-r1',
          ranking: 4,
          best: 500,
          average: 600,
        },
        {
          roundId: '333-r2',
          ranking: 3,
          best: 700,
          average: 800,
        },
        {
          roundId: '333-r3',
          ranking: 2,
          best: 600,
          average: 700,
        },
      ]);
    });

    it('matches personal WCA API results by name when the competitor has no WCA ID', () => {
      const results = getPersonalResultsFromSources({
        wcif,
        person: persons[2],
        wcaApiResults: [
          apiResult({
            id: 9200,
            pos: 8,
            best: 1500,
            average: 1600,
            name: 'Casey Solver',
            wca_id: null,
          }),
        ],
        wcaLiveResults: [],
      });

      expect(results[0].rounds).toMatchObject([
        {
          roundId: '333-r2',
          ranking: 8,
          best: 1500,
          average: 1600,
        },
      ]);
    });

    it('does not include a same-name API result with a conflicting WCA ID', () => {
      const results = getPersonalResultsFromSources({
        wcif,
        person: persons[0],
        wcaApiResults: [
          apiResult({
            id: 9201,
            name: 'Alice Solver',
            wca_id: '2010BOBS01',
          }),
        ],
        wcaLiveResults: [],
      });

      expect(results[0].rounds.map((round) => round.roundId)).toEqual(['333-r1']);
    });

    it('sorts live personal events and rounds before merging them', () => {
      const secondRound = livePersonalResult({
        id: 'live-personal-333-r2',
        round: {
          id: 'live-round-333-r2',
          name: 'Second Round',
          number: 2,
          competitionEvent: {
            id: 'live-event-333',
            event: {
              id: '333',
              name: '3x3x3 Cube',
              rank: 10,
            },
          },
          format: {
            id: 'a',
            numberOfAttempts: 5,
            sortBy: 'average',
          },
        },
      });
      const earlierRankedEvent = livePersonalResult({
        id: 'live-personal-222-r1',
        round: {
          id: 'live-round-222-r1',
          name: 'First Round',
          number: 1,
          competitionEvent: {
            id: 'live-event-222',
            event: {
              id: '222',
              name: '2x2x2 Cube',
              rank: 5,
            },
          },
          format: {
            id: 'a',
            numberOfAttempts: 5,
            sortBy: 'average',
          },
        },
      });

      const results = getPersonalResultsFromSources({
        wcif,
        person: persons[0],
        wcaApiResults: [],
        wcaLiveResults: [secondRound, livePersonalResult(), earlierRankedEvent],
      });

      expect(results.map((result) => result.eventId)).toEqual(['333', '222']);
      expect(results.find((result) => result.eventId === '333')?.rounds).toMatchObject([
        { roundId: '333-r1', roundNumber: 1 },
        { roundId: '333-r2', roundNumber: 2 },
      ]);
    });
  });
});
