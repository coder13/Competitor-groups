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

      if (key === 'common.activityCodeToName.round') {
        return `Round ${options?.roundNumber}`;
      }

      return key;
    },
  }),
}));

const linkedRoundsCompetition = {
  formatVersion: '1.0',
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
          format: 'a',
          cutoff: null,
          timeLimit: null,
          advancementCondition: null,
          results: [],
        },
        {
          id: '333-r2',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          advancementCondition: null,
          results: [],
        },
        {
          id: '333-r3',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          participationRuleset: {
            participationSource: {
              type: 'linkedRounds',
              roundIds: ['333-r1', '333-r2'],
              resultCondition: {
                type: 'ranking',
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
} as unknown as Competition;

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({
    competitionId: 'TestComp2026',
    wcif: linkedRoundsCompetition,
    setTitle: () => {},
  }),
  useWcifUtils: () => ({
    roundActivies: linkedRoundsCompetition.schedule.venues[0].rooms[0].activities,
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
  it('shows linked-round context for rounds in a dual-round advancement set', () => {
    renderRound('333-r2');

    expect(screen.getByText('Dual round with Round 1')).toBeInTheDocument();
  });

  it('does not show linked-round context for rounds outside a dual-round advancement set', () => {
    renderRound('333-r3');

    expect(screen.queryByText(/Dual round with/i)).not.toBeInTheDocument();
  });
});
