import { Round } from '@wca/helpers';
import { RoundAdvancementCondition } from '@/lib/wcif';
import { getStoredRoundResults } from './advancement';

describe('getStoredRoundResults', () => {
  it('rounds percentage advancement down to a whole competitor', () => {
    const round = {
      id: '333-r1',
      format: 'a',
      results: Array.from({ length: 42 }, (_, index) => ({
        personId: index + 1,
        ranking: index + 1,
        attempts: [{ result: 1000 + index }],
        best: 1000 + index,
        average: 1000 + index,
      })),
    } as Round;
    const advancementCondition: RoundAdvancementCondition = {
      sourceType: 'round',
      sourceRoundIds: ['333-r1'],
      targetRoundId: '333-r2',
      resultCondition: {
        type: 'percent',
        value: 75,
      },
      reservedPlaces: null,
    };

    const results = getStoredRoundResults(round, advancementCondition);

    expect(results.filter((result) => result.advancing)).toHaveLength(31);
    expect(results[30].advancing).toBe(true);
    expect(results[31].advancing).toBe(false);
  });
});
