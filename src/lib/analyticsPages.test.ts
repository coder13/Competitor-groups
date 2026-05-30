import { competitionPageName } from './analyticsPages';

describe('analyticsPages', () => {
  it.each([
    ['/competitions/ExampleComp2026', 'groups'],
    ['/competitions/ExampleComp2026/events', 'events'],
    ['/competitions/ExampleComp2026/events/333-r1', 'event_groups'],
    ['/competitions/ExampleComp2026/events/333-r1/2', 'event_group'],
    ['/competitions/ExampleComp2026/activities', 'schedule'],
    ['/competitions/ExampleComp2026/activities/1', 'schedule_activity'],
    ['/competitions/ExampleComp2026/rooms', 'schedule_rooms'],
    ['/competitions/ExampleComp2026/rooms/main', 'schedule_room'],
    ['/competitions/ExampleComp2026/admin/remote', 'live_activities'],
    ['/competitions/ExampleComp2026/admin/scramblers', 'assignments'],
    ['/competitions/ExampleComp2026/persons/12/results', 'person_results'],
    ['/competitions/ExampleComp2026/persons/wca/2016TEST01/results', 'person_wca_results'],
  ])('maps %s to %s', (pathname, page) => {
    expect(competitionPageName(pathname, 'ExampleComp2026')).toBe(page);
  });

  it('uses stable coarse labels for unknown competition routes', () => {
    expect(
      competitionPageName(
        '/competitions/ExampleComp2026/custom/potentially-sensitive-value',
        'ExampleComp2026',
      ),
    ).toBe('other');
  });

  it('uses stable coarse labels for unknown admin routes', () => {
    expect(
      competitionPageName(
        '/competitions/ExampleComp2026/admin/potentially-sensitive-value',
        'ExampleComp2026',
      ),
    ).toBe('admin_other');
  });
});
