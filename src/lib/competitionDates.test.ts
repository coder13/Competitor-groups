import { isCompetitionDayOrAfter } from './competitionDates';

const wcif = {
  schedule: {
    numberOfDays: 2,
    startDate: '2026-06-01',
  },
};

describe('competitionDates', () => {
  it('detects dates on or after the competition start date', () => {
    expect(isCompetitionDayOrAfter(wcif as never, new Date(2026, 4, 31))).toBe(false);
    expect(isCompetitionDayOrAfter(wcif as never, new Date(2026, 5, 1))).toBe(true);
    expect(isCompetitionDayOrAfter(wcif as never, new Date(2026, 5, 3))).toBe(true);
  });
});
