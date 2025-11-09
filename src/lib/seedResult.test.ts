import { EventId } from '@wca/helpers';
import { renderResultByEventId } from '@/lib/results';

// Mock the WCA helpers functions since we're testing null/undefined handling
jest.mock('@wca/helpers', () => ({
  formatCentiseconds: jest.fn((time) => {
    if (typeof time !== 'number' || isNaN(time)) {
      return 'NaN';
    }
    return (time / 100).toFixed(2);
  }),
  formatMultiResult: jest.fn(() => 'MBLD Result'),
  decodeMultiResult: jest.fn(() => ({ attempted: 1, solved: 1 })),
}));

describe('seedResult edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderResultByEventId null/undefined handling', () => {
    it('should return empty string when result is null', () => {
      const result = renderResultByEventId('333' as EventId, 'single', null as any);
      expect(result).toBe('');
    });

    it('should return empty string when result is undefined', () => {
      const result = renderResultByEventId('333' as EventId, 'single', undefined as any);
      expect(result).toBe('');
    });

    it('should return empty string when result is NaN', () => {
      const result = renderResultByEventId('333' as EventId, 'single', NaN);
      expect(result).toBe('');
    });

    it('should handle valid results correctly for 333', () => {
      const result = renderResultByEventId('333' as EventId, 'single', 1050);
      expect(result).toBe('10.50');
    });

    it('should handle 333fm average with null result', () => {
      const result = renderResultByEventId('333fm' as EventId, 'average', null as any);
      expect(result).toBe('');
    });

    it('should handle 333fm single with undefined result', () => {
      const result = renderResultByEventId('333fm' as EventId, 'single', undefined as any);
      expect(result).toBe('');
    });

    it('should handle 333fm average correctly with valid result', () => {
      const result = renderResultByEventId('333fm' as EventId, 'average', 3000);
      expect(result).toBe('30.00');
    });

    it('should handle 333fm single correctly with valid result', () => {
      const result = renderResultByEventId('333fm' as EventId, 'single', 30);
      expect(result).toBe(30);
    });
  });
});
