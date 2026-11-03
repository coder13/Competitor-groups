import { formatDateTimeRange, formmatDate } from './time';

describe('venue-local date and time ranges', () => {
  beforeEach(() => {
    jest.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
  });

  afterEach(() => jest.restoreAllMocks());

  it('shows the Campulung venue time and preserves five-minute rounding', () => {
    expect(
      formatDateTimeRange('2026-10-31T07:00:00Z', '2026-10-31T07:22:30Z', 5, 'Europe/Bucharest'),
    ).toBe('Sat 09:00 AM - 09:25 AM');
  });

  it('shows Saturday for Concours even when the viewer is still on Friday', () => {
    expect(
      formatDateTimeRange('2026-10-31T03:15:00Z', '2026-10-31T03:55:00Z', 5, 'Asia/Calcutta'),
    ).toBe('Sat 08:45 AM - 09:25 AM');
    expect(formmatDate('2026-10-31T03:15:00Z', 5, 'Asia/Calcutta')).toBe('Sat');
  });

  it('repeats weekdays when a range crosses venue midnight but not viewer midnight', () => {
    expect(
      formatDateTimeRange('2026-10-31T18:00:00Z', '2026-10-31T19:00:00Z', 5, 'Asia/Calcutta'),
    ).toBe('Sat 11:30 PM - Sun 12:30 AM');
  });

  it('uses one weekday when a range crosses UTC midnight but not venue midnight', () => {
    expect(
      formatDateTimeRange('2026-10-30T23:30:00Z', '2026-10-31T00:30:00Z', 5, 'Asia/Calcutta'),
    ).toBe('Sat 05:00 AM - 06:00 AM');
  });

  it('compares dates after rounding across midnight', () => {
    expect(
      formatDateTimeRange('2026-10-31T18:29:00Z', '2026-10-31T18:40:00Z', 5, 'Asia/Calcutta'),
    ).toBe('Sun 12:00 AM - 12:10 AM');
  });

  it('uses the requested rounding interval for the weekday as well as the time', () => {
    expect(
      formatDateTimeRange('2026-10-31T18:29:00Z', '2026-10-31T18:30:00Z', 1, 'Asia/Calcutta'),
    ).toBe('Sat 11:59 PM - Sun 12:00 AM');
  });
});
