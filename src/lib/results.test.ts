import { renderResultByEventId } from './results';

describe('renderResultByEventId', () => {
  it('should return empty string for null result', () => {
    expect(renderResultByEventId('333', 'single', null as any)).toBe('');
  });

  it('should return empty string for undefined result', () => {
    expect(renderResultByEventId('333', 'single', undefined as any)).toBe('');
  });

  it('should return empty string for NaN result', () => {
    expect(renderResultByEventId('333', 'single', NaN)).toBe('');
  });

  it('should handle valid results correctly', () => {
    // Test with a valid centisecond time (10.50 seconds = 1050 centiseconds)
    const result = renderResultByEventId('333', 'single', 1050);
    expect(result).toBe('10.50');
  });

  it('should handle 333fm average correctly', () => {
    // Test with FMC average (30.00 moves = 3000)
    const result = renderResultByEventId('333fm', 'average', 3000);
    expect(result).toBe('30.00');
  });

  it('should handle 333fm single correctly', () => {
    // Test with FMC single (30 moves)
    const result = renderResultByEventId('333fm', 'single', 30);
    expect(result).toBe(30);
  });
});
