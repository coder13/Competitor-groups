import { Competition, Person } from '@wca/helpers';
import { WcaCompetitionResult } from '@/lib/api';
import { getSumOfRanks } from './rankings';

jest.mock('@/lib/events', () => ({
  getAllEvents: (wcif: Competition) => wcif.events,
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
    assignments: [],
    extensions: [],
  },
  {
    registrantId: 2,
    name: 'Bob Solver',
    wcaUserId: 1002,
    wcaId: '2010BOBS01',
    countryIso2: 'US',
    registration: null,
    assignments: [],
    extensions: [],
  },
  {
    registrantId: 3,
    name: 'Casey Solver',
    wcaUserId: 1003,
    wcaId: null,
    countryIso2: 'US',
    registration: null,
    assignments: [],
    extensions: [],
  },
  {
    registrantId: 4,
    name: 'No Results',
    wcaUserId: 1004,
    wcaId: null,
    countryIso2: 'US',
    registration: null,
    assignments: [],
    extensions: [],
  },
];

const wcif = {
  formatVersion: '1.0',
  id: 'SumRanksTest2026',
  name: 'Sum Ranks Test 2026',
  shortName: 'Sum Ranks Test',
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
              attempts: [{ result: 1200, reconstruction: null }],
              best: 1200,
              average: 1200,
            },
            {
              personId: 2,
              ranking: 2,
              attempts: [{ result: 1300, reconstruction: null }],
              best: 1300,
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
          results: [
            {
              personId: 2,
              ranking: 1,
              attempts: [{ result: 1100, reconstruction: null }],
              best: 1100,
              average: 1100,
            },
          ],
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
  schedule: { numberOfDays: 1, startDate: '2026-05-03', venues: [] },
} as Competition;

const apiResult = (overrides: Partial<WcaCompetitionResult> = {}): WcaCompetitionResult => ({
  id: 9000,
  pos: 1,
  best: 1000,
  average: 1100,
  name: 'Casey Solver',
  country_iso2: 'US',
  competition_id: wcif.id,
  event_id: '333',
  round_type_id: '3',
  format_id: 'a',
  wca_id: null,
  attempts: [1000, 1100, 1200],
  ...overrides,
});

describe('getSumOfRanks', () => {
  it('sums rankings across ranked rounds and penalizes missed ranked rounds', () => {
    const rankings = getSumOfRanks(wcif, []);

    expect(rankings.map((ranking) => [ranking.person.name, ranking.sumOfRanks])).toEqual([
      ['Bob Solver', 3],
      ['Alice Solver', 3],
    ]);
    expect(rankings.find((ranking) => ranking.person.name === 'Alice Solver')?.missedRounds).toBe(
      1,
    );
    expect(rankings.find((ranking) => ranking.person.name === 'No Results')).toBeUndefined();
  });

  it('uses WCA API fallback results when WCIF results are missing for a round', () => {
    const rankings = getSumOfRanks(wcif, [
      apiResult(),
      apiResult({
        id: 9001,
        pos: 2,
        name: 'Bob Solver',
        wca_id: '2010BOBS01',
        best: 1300,
        average: 1400,
      }),
    ]);

    expect(rankings.map((ranking) => [ranking.person.name, ranking.sumOfRanks])).toEqual([
      ['Bob Solver', 5],
      ['Alice Solver', 6],
      ['Casey Solver', 6],
    ]);
    expect(rankings.find((ranking) => ranking.person.name === 'Casey Solver')?.scores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          roundId: '333-r3',
          ranking: 1,
          kinch: 1,
          medal: true,
          missed: false,
        }),
      ]),
    );
    expect(rankings.find((ranking) => ranking.person.name === 'Bob Solver')?.medals).toEqual([
      expect.objectContaining({ eventId: '333', roundNumber: 3 }),
    ]);
  });

  it('ignores rounds that have no WCIF or fallback results', () => {
    const rankings = getSumOfRanks(wcif, []);

    expect(rankings[0]?.roundsCounted).toBe(2);
  });

  it('averages Kinch across counted rounds with missed rounds scored as zero', () => {
    const rankings = getSumOfRanks(wcif, []);

    expect(rankings.find((ranking) => ranking.person.name === 'Alice Solver')?.kinch).toBe(0.5);
    expect(rankings.find((ranking) => ranking.person.name === 'Bob Solver')?.kinch).toBeCloseTo(
      0.9615,
      4,
    );
  });
});
