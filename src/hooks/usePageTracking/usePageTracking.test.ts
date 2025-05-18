import ReactGA from 'react-ga';

describe('hooks/usePageTracking', () => {
  ReactGA.initialize('foo', { testMode: true });

  it('should track page views', () => {
    ReactGA.pageview('/mypage');
    expect(ReactGA.testModeAPI.calls).toEqual([
      ['create', 'foo', 'auto'],
      ['send', { hitType: 'pageview', page: '/mypage' }],
    ]);
  });
});
