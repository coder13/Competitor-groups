import { fetchWcif } from './api';
import { getAdvancementConditionForRound } from './wcif';
import { normalizeWcifV2, WcifV2 } from './wcifV2';

jest.mock('./wca-env', () => ({ WCA_ORIGIN: 'https://api.worldcubeassociation.org' }));

const fixture = () =>
  ({
    id: 'Synthetic2026',
    formatVersion: '2.2',
    persons: [
      {
        registrantId: 1,
        name: 'Synthetic',
        assignments: [{ activityId: 4, assignmentCode: 'competitor' }],
        personalBests: [{ eventId: '333', type: 'single', value: 789, worldRanking: 100 }],
      },
    ],
    events: [
      {
        id: '333',
        qualification: {
          latestResultDate: '2026-10-01',
          earliestResultDate: null,
          resultCondition: { type: 'resultAchieved', scope: 'single', value: 1000 },
        },
        rounds: [
          {
            id: '333-r1',
            format: 'a',
            linkedRounds: ['333-r1', '333-r2'],
            participationRuleset: null,
            results: [
              {
                personId: 1,
                ranking: 1,
                best: 789,
                average: -1,
                attempts: [789, -1, -2, 0, 990123401].map((value) => ({
                  value,
                  reconstruction: null,
                })),
              },
            ],
          },
          {
            id: '333-r2',
            format: 'h',
            linkedRounds: ['333-r1', '333-r2'],
            participationRuleset: null,
            results: [],
          },
          {
            id: '333-r3',
            format: 'a',
            participationRuleset: {
              participationSource: {
                type: 'linkedRounds',
                roundIds: ['333-r1', '333-r2'],
                resultCondition: { type: 'ranking', scope: 'average', value: 12 },
              },
              reservedPlaces: { count: 1 },
            },
            results: [],
          },
        ],
      },
    ],
    schedule: { venues: [] },
    extensions: [{ id: 'synthetic', data: { retained: true } }],
  }) as unknown as WcifV2;

describe('WCIF v2 boundary', () => {
  it('preserves results, assignments and v2 rules while supplying helper aliases', () => {
    const source = fixture();
    const original = JSON.stringify(source);
    const normalized = normalizeWcifV2(source);
    expect(normalized.persons[0].personalBests![0].best).toBe(789);
    expect(normalized.events[0].rounds[0].results[0].attempts.map((a) => a.result)).toEqual([
      789, -1, -2, 0, 990123401,
    ]);
    expect(normalized.events[0].rounds[0].results[0].best).toBe(789);
    expect(normalized.persons[0].assignments).toEqual(source.persons[0].assignments);
    expect(normalized.schedule).toEqual(source.schedule);
    expect(normalized.extensions).toEqual(source.extensions);
    expect(normalized.events[0].qualification).toMatchObject({
      latestResultDate: '2026-10-01',
      level: 1000,
      resultType: 'single',
    });
    expect(
      getAdvancementConditionForRound(normalized.events[0].rounds, normalized.events[0].rounds[0]),
    ).toMatchObject({
      sourceType: 'linkedRounds',
      sourceRoundIds: ['333-r1', '333-r2'],
      targetRoundId: '333-r3',
      resultCondition: { type: 'ranking', scope: 'average', value: 12 },
      reservedPlaces: { count: 1 },
    });
    expect(JSON.stringify(source)).toBe(original);
  });
  it.each(['1.2', '3.0', ''])('rejects unexpected schema %s', (version) => {
    expect(() => normalizeWcifV2({ ...fixture(), formatVersion: version })).toThrow(
      'major version 2',
    );
  });
  it('does not turn missing or malformed values into results', () => {
    const source = fixture();
    delete (source.persons[0].personalBests![0] as Partial<{ value: number }>).value;
    expect(() => normalizeWcifV2(source)).toThrow('result value');
  });
  it('pins the public request to v2 and normalizes the response', async () => {
    const previous = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => fixture() });
    try {
      expect((await fetchWcif('Synthetic2026')).persons[0].personalBests![0].best).toBe(789);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.worldcubeassociation.org/competitions/Synthetic2026/wcif/version/2',
        {},
      );
    } finally {
      global.fetch = previous;
    }
  });
});
