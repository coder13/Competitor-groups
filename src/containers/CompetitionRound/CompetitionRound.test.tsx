import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Competition } from '@wca/helpers';
import { AnchorLink } from '@/lib/linkRenderer';
import { CompetitionRoundContainer } from './CompetitionRound';

jest.mock('@/components/Breadcrumbs/Breadcrumbs', () => ({
  Breadcrumbs: () => <div>breadcrumbs</div>,
}));

jest.mock('@/components/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/CutoffTimeLimitPanel', () => ({
  CutoffTimeLimitPanel: () => <div>cutoff panel</div>,
}));

jest.mock('@/lib/activityCodes', () => ({
  activityCodeToName: (activityCode: string) => activityCode,
  parseActivityCodeFlexible: (activityCode: string) => {
    const groupMatch = activityCode.match(/-g(\d+)$/);
    return {
      eventId: '333',
      roundNumber: 2,
      groupNumber: groupMatch ? parseInt(groupMatch[1], 10) : null,
      attemptNumber: null,
    };
  },
  toRoundAttemptId: (activityCode: string) => activityCode.replace(/-g\d+$/, ''),
}));

jest.mock('@/lib/events', () => ({
  getAllEvents: (wcif: Competition) => wcif.events,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'competition.groups.allGroups') {
        return 'All Groups';
      }

      if (key === 'competition.groups.backToEvents') {
        return 'Back To Events';
      }

      if (key === 'competition.round.linkedWith') {
        return `Dual round with ${options?.rounds}`;
      }

      if (key === 'competition.results.seeResults') {
        return 'See Results';
      }

      if (key === 'common.activityCodeToName.round') {
        return `Round ${options?.roundNumber}`;
      }

      if (key === 'common.activityCodeToName.group') {
        return `Group ${options?.groupNumber}`;
      }

      return key;
    },
  }),
}));

const linkedRoundsCompetition: Competition = {
  series: null,
  registrationInfo: {
    openTime: '2026-01-01T00:00:00Z',
    closeTime: '2026-04-01T00:00:00Z',
    baseEntryFee: 0,
    currencyCode: 'USD',
    onTheSpotRegistration: false,
    useWcaRegistration: true,
  },
  formatVersion: '2.0',
  id: 'TestComp2026',
  name: 'Test Competition 2026',
  shortName: 'Test Comp 2026',
  persons: [],
  competitorLimit: null,
  extensions: [],
  events: [
    {
      id: '333',
      extensions: [],
      rounds: [
        {
          id: '333-r1',
          extensions: [],
          format: 'a',
          cutoff: null,
          timeLimit: null,
          linkedRounds: null,
          participationRuleset: null,
          results: [],
        },
        {
          id: '333-r2',
          extensions: [],
          format: 'a',
          cutoff: null,
          timeLimit: null,
          linkedRounds: null,
          participationRuleset: null,
          results: [
            {
              personId: 1,
              ranking: 1,
              attempts: [],
              best: 1000,
              average: 1200,
            },
          ],
        },
        {
          id: '333-r3',
          extensions: [],
          format: 'a',
          cutoff: null,
          timeLimit: null,
          linkedRounds: null,
          participationRuleset: {
            reservedPlaces: null,
            participationSource: {
              type: 'linkedRounds',
              roundIds: ['333-r1', '333-r2'],
              resultCondition: {
                type: 'ranking',
                scope: 'average',
                value: 12,
              },
            },
          },
          results: [],
        },
      ],
    },
  ],
  schedule: {
    numberOfDays: 1,
    startDate: '2026-05-03',
    venues: [
      {
        id: 1,
        name: 'Main Venue',
        latitudeMicrodegrees: 0,
        longitudeMicrodegrees: 0,
        countryIso2: 'US',
        timezone: 'America/Los_Angeles',
        extensions: [],
        rooms: [
          {
            id: 1,
            name: 'Main Room',
            color: '#fff',
            activities: [
              {
                id: 10,
                activityCode: '333-r2',
                name: '3x3x3 Cube, Round 2',
                startTime: '2026-05-03T16:00:00Z',
                endTime: '2026-05-03T17:00:00Z',
                childActivities: [
                  {
                    id: 11,
                    activityCode: '333-r2-g1',
                    name: '3x3x3 Cube, Round 2, Group 1',
                    startTime: '2026-05-03T16:00:00Z',
                    endTime: '2026-05-03T16:30:00Z',
                    childActivities: [],
                    extensions: [],
                    scrambleSetId: null,
                  },
                ],
                extensions: [],
                scrambleSetId: null,
              },
            ],
            extensions: [],
          },
        ],
      },
    ],
  },
};

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({
    competitionId: 'TestComp2026',
    wcif: linkedRoundsCompetition,
    setTitle: () => {},
  }),
  useWcifUtils: () => ({
    roundActivies: linkedRoundsCompetition.schedule.venues.flatMap((venue) =>
      venue.rooms.flatMap((room) => room.activities),
    ),
  }),
}));

function renderRound(roundId: string) {
  return render(
    <CompetitionRoundContainer
      competitionId="TestComp2026"
      roundId={roundId}
      LinkComponent={AnchorLink}
    />,
  );
}

describe('CompetitionRoundContainer', () => {
  it.each([
    ['Europe/Bucharest', '2026-10-31T07:00:00Z', '2026-10-31T07:22:30Z', 'Sat 09:00 AM - 09:25 AM'],
    ['Asia/Calcutta', '2026-10-31T03:15:00Z', '2026-10-31T03:55:00Z', 'Sat 08:45 AM - 09:25 AM'],
  ])('shows group times in the %s venue timezone', (timezone, startTime, endTime, expected) => {
    const venue = linkedRoundsCompetition.schedule.venues[0];
    const group = venue.rooms[0].activities[0].childActivities[0];
    const original = {
      timezone: venue.timezone,
      startTime: group.startTime,
      endTime: group.endTime,
    };
    const languages = jest.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
    try {
      venue.timezone = timezone;
      group.startTime = startTime;
      group.endTime = endTime;
      renderRound('333-r2');
      expect(screen.getByText(expected)).toBeInTheDocument();
    } finally {
      venue.timezone = original.timezone;
      group.startTime = original.startTime;
      group.endTime = original.endTime;
      languages.mockRestore();
    }
  });

  it('keeps separate local ranges when the same group runs in different venue timezones', () => {
    const originalVenue = linkedRoundsCompetition.schedule.venues[0];
    const secondVenue = {
      ...originalVenue,
      id: 2,
      timezone: 'Asia/Calcutta',
      rooms: originalVenue.rooms.map((room) => ({
        ...room,
        id: 2,
        activities: room.activities.map((activity) => ({
          ...activity,
          id: 20,
          childActivities: activity.childActivities.map((child) => ({ ...child, id: 21 })),
        })),
      })),
    };
    const languages = jest.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
    linkedRoundsCompetition.schedule.venues.push(secondVenue);
    try {
      renderRound('333-r2');
      expect(screen.getByText('Sun 09:00 AM - 09:30 AM (America/Los_Angeles)')).toBeInTheDocument();
      expect(screen.getByText('Sun 09:30 PM - 10:00 PM (Asia/Calcutta)')).toBeInTheDocument();
      expect(screen.getAllByText('Group 1')).toHaveLength(1);
    } finally {
      linkedRoundsCompetition.schedule.venues.pop();
      languages.mockRestore();
    }
  });

  it('shows linked-round context for rounds in a dual-round advancement set', () => {
    renderRound('333-r2');

    expect(screen.getByText('Dual round with Round 1')).toBeInTheDocument();
  });

  it('does not show linked-round context for rounds outside a dual-round advancement set', () => {
    renderRound('333-r3');

    expect(screen.queryByText(/Dual round with/i)).not.toBeInTheDocument();
  });

  it('links to results for the selected round', () => {
    renderRound('333-r2');

    const resultsLink = screen.getByText('See Results');

    expect(resultsLink).toHaveAttribute('href', '/competitions/TestComp2026/results/333-r2');
    expect(screen.getByText('Group 1').compareDocumentPosition(resultsLink)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('uses shared button spacing for the back link', () => {
    renderRound('333-r2');

    expect(screen.getByText('Back To Events')).toHaveClass('btn', 'btn-block');
  });

  it('shows when the selected round has results', () => {
    renderRound('333-r2');

    expect(screen.getByText('See Results')).toHaveClass('btn-green');
  });

  it('shows a neutral results link when the selected round has no results yet', () => {
    renderRound('333-r3');

    expect(screen.getByText('See Results')).toHaveClass('btn-light');
  });
  it('shows explicit dual-final links even without a later advancement rule', () => {
    const rounds = linkedRoundsCompetition.events[0].rounds;
    const previousLinks = rounds[1].linkedRounds;
    const previousRules = rounds[2].participationRuleset;
    rounds[1].linkedRounds = ['333-r1', '333-r2'];
    rounds[2].participationRuleset = null;
    try {
      renderRound('333-r2');
      expect(screen.getByText('Dual round with Round 1')).toBeInTheDocument();
    } finally {
      rounds[1].linkedRounds = previousLinks;
      rounds[2].participationRuleset = previousRules;
    }
  });
});

it.each(['333-r99', 'not-a-round', '999-r1'])(
  'explains missing round %s without implying that it has a schedule or results',
  (roundId) => {
    const { rerender } = renderRound(roundId);
    expect(screen.getByRole('status')).toHaveTextContent('competition.results.roundNotFound');
    expect(screen.queryByText('See Results')).not.toBeInTheDocument();
    expect(screen.getByText('Back To Events')).toHaveAttribute(
      'href',
      '/competitions/TestComp2026/events/',
    );
    rerender(<CompetitionRoundContainer competitionId="TestComp2026" roundId="333-r2" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Group 1')).toBeInTheDocument();
  },
);
