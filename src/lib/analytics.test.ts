import {
  __resetAnalyticsForTests,
  configureUmamiAnalytics,
  identifyUser,
  isValidEventName,
  loadUmamiScript,
  trackCompetitionEvent,
  trackEvent,
} from './analytics';

describe('analytics', () => {
  beforeEach(() => {
    __resetAnalyticsForTests();
    document.head.innerHTML = '';
    window.umami = undefined;
  });

  it('loads the Umami script only when configured', () => {
    loadUmamiScript();

    expect(document.querySelector('script')).toBeNull();

    loadUmamiScript({
      src: 'https://analytics.example.com/script.js',
      websiteId: 'website-id',
    });
    loadUmamiScript({
      src: 'https://analytics.example.com/script.js',
      websiteId: 'website-id',
    });

    const scripts = document.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveAttribute('src', 'https://analytics.example.com/script.js');
    expect(scripts[0]).toHaveAttribute('data-website-id', 'website-id');
  });

  it('no-ops when Umami is not available', () => {
    expect(() => trackEvent('competition_viewed')).not.toThrow();
  });

  it('flushes route events that fire before the Umami script loads', () => {
    configureUmamiAnalytics({
      src: 'https://analytics.example.com/script.js',
      websiteId: 'website-id',
    });

    trackCompetitionEvent('competition_viewed', {
      competitionId: 'ExampleComp2026',
      page: 'groups',
    });

    loadUmamiScript({
      src: 'https://analytics.example.com/script.js',
      websiteId: 'website-id',
    });

    const track = jest.fn();
    window.umami = { track };
    document.querySelector('script')?.dispatchEvent(new Event('load'));

    expect(track).toHaveBeenCalledWith(
      'competition_viewed',
      expect.objectContaining({
        app: 'competitiongroups',
        auth_status: 'anonymous',
        competition_id: 'ExampleComp2026',
        page: 'groups',
      }),
    );
  });

  it('tracks event data with shared app and auth properties', () => {
    const track = jest.fn();
    window.umami = { track };

    trackCompetitionEvent('competition_viewed', {
      competitionId: 'ExampleComp2026',
      page: 'groups',
      user_id: 123,
    });

    expect(track).toHaveBeenCalledWith(
      'competition_viewed',
      expect.objectContaining({
        app: 'competitiongroups',
        auth_status: 'logged_in',
        competition_id: 'ExampleComp2026',
        page: 'groups',
        user_id: '123',
      }),
    );
  });

  it('does not send invalid event names', () => {
    const track = jest.fn();
    window.umami = { track };

    expect(isValidEventName('x'.repeat(51))).toBe(false);
    trackEvent('x'.repeat(51));

    expect(track).not.toHaveBeenCalled();
  });

  it('identifies logged-in users by numeric ID only', () => {
    const identify = jest.fn();
    window.umami = {
      identify,
      track: jest.fn(),
    };

    identifyUser(123);

    expect(identify).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        app: 'competitiongroups',
        auth_status: 'logged_in',
      }),
    );
  });

  it('identifies logged-in users after the Umami script loads', () => {
    loadUmamiScript({
      src: 'https://analytics.example.com/script.js',
      websiteId: 'website-id',
    });

    identifyUser(123);

    const identify = jest.fn();
    window.umami = {
      identify,
      track: jest.fn(),
    };
    document.querySelector('script')?.dispatchEvent(new Event('load'));

    expect(identify).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        app: 'competitiongroups',
        auth_status: 'logged_in',
      }),
    );
  });
});
