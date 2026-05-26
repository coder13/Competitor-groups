import { WcaCompetitionResult } from '@/lib/api';
import {
  compareUserResultsByNewest,
  formatUserResult,
  getCompetitionResultSummaries,
  getEventResultSummaries,
  getHistoricalPrFlags,
  getPersonalRecords,
  getRoundTypeName,
} from './userProfileData';

jest.mock('@/lib/events', () => ({
  getEventName: (eventId: string) => eventId,
  isOfficialEventId: (eventId: string) => ['222', '333'].includes(eventId),
  isRankedBySingle: () => false,
}));

const result = (overrides: Partial<WcaCompetitionResult>): WcaCompetitionResult => ({
  id: 1,
  pos: 1,
  best: 1000,
  average: 1200,
  name: 'Test User',
  country_iso2: 'US',
  competition_id: 'TestComp2026',
  event_id: '333',
  round_type_id: 'f',
  format_id: 'a',
  wca_id: '2010TEST01',
  attempts: [],
  ...overrides,
});

describe('userProfileData', () => {
  describe('getCompetitionResultSummaries', () => {
    it('aggregates results by competition', () => {
      const summaries = getCompetitionResultSummaries([
        result({ competition_id: 'Alpha2026', event_id: '333', best: 1200, average: 1300 }),
        result({ competition_id: 'Alpha2026', event_id: '222', best: 300, average: 360 }),
        result({ competition_id: 'Beta2026', event_id: '333', best: 1000 }),
      ]);

      expect(summaries).toEqual([
        expect.objectContaining({
          competitionId: 'Alpha2026',
          roundCount: 2,
          eventCount: 2,
        }),
        expect.objectContaining({
          competitionId: 'Beta2026',
          roundCount: 1,
          eventCount: 1,
        }),
      ]);
      expect(summaries[0].bestResult.event_id).toBe('222');
    });
  });

  describe('getEventResultSummaries', () => {
    it('aggregates results by event', () => {
      const summaries = getEventResultSummaries([
        result({ competition_id: 'Alpha2026', event_id: '333', best: 1200, average: 1400 }),
        result({ competition_id: 'Beta2026', event_id: '333', best: 1000, average: 1300 }),
        result({ competition_id: 'Beta2026', event_id: '222', best: 280, average: 360 }),
      ]);

      expect(summaries).toEqual([
        expect.objectContaining({
          eventId: '222',
          roundCount: 1,
          competitionCount: 1,
          bestSingle: 280,
          bestAverage: 360,
        }),
        expect.objectContaining({
          eventId: '333',
          roundCount: 2,
          competitionCount: 2,
          bestSingle: 1000,
          bestAverage: 1300,
        }),
      ]);
    });
  });

  describe('formatUserResult', () => {
    it('formats timed results and missing results', () => {
      expect(formatUserResult('333', 'single', 1234)).toBe('12.34');
      expect(formatUserResult('333', 'average', 0)).toBe('-');
    });
  });

  describe('getRoundTypeName', () => {
    it('formats WCA round type ids', () => {
      expect(getRoundTypeName('1')).toBe('First round');
      expect(getRoundTypeName('f')).toBe('Final');
    });
  });

  describe('compareUserResultsByNewest', () => {
    it('sorts newer competition ids first', () => {
      const sorted = [
        result({ competition_id: 'Alpha2025' }),
        result({ competition_id: 'Beta2026' }),
      ].sort(compareUserResultsByNewest);

      expect(sorted.map((item) => item.competition_id)).toEqual(['Beta2026', 'Alpha2025']);
    });
  });

  describe('getHistoricalPrFlags', () => {
    it('flags singles and averages when they become new personal records', () => {
      const flags = getHistoricalPrFlags([
        result({ id: 4, competition_id: 'Delta2026', round_type_id: '1', best: 1100, average: 0 }),
        result({
          id: 2,
          competition_id: 'Beta2025',
          round_type_id: '1',
          best: 1200,
          average: 1400,
        }),
        result({
          id: 3,
          competition_id: 'Charlie2025',
          round_type_id: '1',
          best: 1300,
          average: 1300,
        }),
        result({
          id: 1,
          competition_id: 'Alpha2025',
          round_type_id: '1',
          best: 1500,
          average: 1600,
        }),
      ]);

      expect(flags).toEqual({
        1: { single: true, average: true },
        2: { single: true, average: true },
        3: { single: false, average: true },
        4: { single: true, average: false },
      });
    });
  });

  describe('getPersonalRecords', () => {
    it('returns top-level records from the WCA person response', () => {
      expect(
        getPersonalRecords({
          person: {},
          personal_records: {
            '333': {
              single: {
                best: 1000,
                world_rank: 1,
                continent_rank: 1,
                country_rank: 1,
              },
            },
          },
        }),
      ).toHaveProperty('333');
    });

    it('falls back to nested records for seeded data', () => {
      expect(
        getPersonalRecords({
          person: {
            personal_records: {
              '222': {
                single: {
                  best: 200,
                  world_rank: 2,
                  continent_rank: 2,
                  country_rank: 2,
                },
              },
            },
          },
        }),
      ).toHaveProperty('222');
    });
  });
});
