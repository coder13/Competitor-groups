import { renderResultByEventId } from './results';

describe('renderResultByEventId', () => {
  it('renders DNF before event-specific formatting', () => {
    expect(renderResultByEventId('333', 'single', -1)).toBe('DNF');
    expect(renderResultByEventId('333fm', 'average', -1)).toBe('DNF');
  });

  it('renders DNS before event-specific formatting', () => {
    expect(renderResultByEventId('333', 'single', -2)).toBe('DNS');
    expect(renderResultByEventId('333mbf', 'single', -2)).toBe('DNS');
  });

  it('keeps normal result formatting unchanged', () => {
    expect(renderResultByEventId('333', 'single', 1234)).toBe('12.34');
    expect(renderResultByEventId('333fm', 'average', 2533)).toBe('25.33');
  });
});
