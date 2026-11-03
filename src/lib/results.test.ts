import { EventId, RankingType } from '@wca/helpers';
import { renderResultByEventId } from './results';

describe('renderResultByEventId', () => {
  it.each<EventId>(['333fm', '333', '333mbf'])(
    'renders DNF and DNS for %s singles and averages',
    (eventId) => {
      for (const rankingType of ['single', 'average'] as RankingType[]) {
        expect(renderResultByEventId(eventId, rankingType, -1)).toBe('DNF');
        expect(renderResultByEventId(eventId, rankingType, -2)).toBe('DNS');
      }
    },
  );

  it('preserves FMC move counts and two-decimal means', () => {
    expect(renderResultByEventId('333fm', 'single', 31)).toBe(31);
    expect(renderResultByEventId('333fm', 'average', 2133)).toBe('21.33');
    expect(renderResultByEventId('333fm', 'average', 3000)).toBe('30.00');
  });

  it('preserves zero formatting for callers that manage missing results', () => {
    expect(renderResultByEventId('333fm', 'single', 0)).toBe(0);
    expect(renderResultByEventId('333fm', 'average', 0)).toBe('0.00');
    expect(renderResultByEventId('333', 'single', 0)).toBe('0.00');
  });

  it('preserves timed and encoded multi-blind results', () => {
    expect(renderResultByEventId('333', 'single', 1234)).toBe('12.34');
    expect(renderResultByEventId('333mbf', 'single', 970060000)).toBe('2/2 10:00');
  });
});
