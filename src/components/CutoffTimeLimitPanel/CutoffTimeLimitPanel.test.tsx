import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Competition, Round } from '@wca/helpers';
import { MemoryRouter } from 'react-router-dom';
import { CutoffTimeLimitPanel } from './CutoffTimeLimitPanel';

jest.mock('react-tiny-popover', () => ({
  Popover: ({
    children,
    content,
    isOpen,
  }: {
    children: React.ReactNode;
    content: React.ReactNode;
    isOpen: boolean;
  }) => (
    <div>
      {children}
      {isOpen ? content : null}
    </div>
  ),
}));

jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values }: { i18nKey: string; values?: Record<string, unknown> }) => {
    if (i18nKey === 'common.wca.advancement.ranking') {
      return `Top ${values?.level} to next round`;
    }

    if (i18nKey === 'common.wca.advancement.percent') {
      return `Top ${values?.level}% to next round`;
    }

    if (i18nKey === 'common.wca.advancement.linkedRanking') {
      return `Top ${values?.level} combined across ${values?.rounds} advance to next round`;
    }

    if (i18nKey === 'common.wca.advancement.linkedPercent') {
      return `Top ${values?.level}% combined across ${values?.rounds} advance to next round`;
    }

    if (i18nKey === 'common.wca.cumulativeTimelimit') {
      return `Time Limit: ${values?.time} Cumulative`;
    }

    if (i18nKey === 'common.wca.cumulativeTimelimitWithrounds') {
      return `Time Limit: ${values?.time} Total with:`;
    }

    return i18nKey;
  },
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'common.help') {
        return 'help';
      }

      if (key === 'common.wca.cutoff') {
        return 'Cutoff';
      }

      if (key === 'common.wca.timeLimit') {
        return 'Time Limit';
      }

      if (key === 'common.activityCodeToName.round') {
        return `Round ${options?.roundNumber}`;
      }

      if (key === 'common.wca.advancement.ranking') {
        return `Top ${options?.level} advance to ${options?.what}`;
      }

      if (key === 'common.wca.advancement.percent') {
        return `Top ${options?.level}% advance to ${options?.what}`;
      }

      if (key === 'common.wca.advancement.linkedRanking') {
        return `Top ${options?.level} in dual rounds ${options?.rounds} advance to ${options?.what}`;
      }

      if (key === 'common.wca.advancement.linkedPercent') {
        return `Top ${options?.level}% in dual rounds ${options?.rounds} advance to ${options?.what}`;
      }

      if (key === 'common.wca.advancement.nextRound') {
        return 'next round';
      }

      if (key === 'common.wca.advancement.final') {
        return 'final';
      }

      if (key === 'common.wca.advancement.resultThresholdUnknown') {
        return 'an unknown result';
      }

      if (options?.defaultValue) {
        return String(options.defaultValue)
          .replace('{{level}}', String(options.level ?? ''))
          .replace('{{rounds}}', String(options.rounds ?? ''))
          .replace('{{round}}', String(options.round ?? ''))
          .replace('{{what}}', String(options.what ?? ''))
          .replace('{{scope}}', String(options.scope ?? ''))
          .replace('{{result}}', String(options.result ?? ''));
      }

      return key;
    },
  }),
}));

const wcifMock: Competition = {
  formatVersion: '2.0',
  name: 'Test Competition',
  shortName: 'Test Competition',
  persons: [],
  series: null,
  competitorLimit: null,
  extensions: [],
  registrationInfo: {
    openTime: '2026-01-01T00:00:00Z',
    closeTime: '2026-04-01T00:00:00Z',
    baseEntryFee: 0,
    currencyCode: 'USD',
    onTheSpotRegistration: false,
    useWcaRegistration: true,
  },
  id: 'TestComp2026',
  schedule: { startDate: '2026-05-03', numberOfDays: 1, venues: [] },
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
          participationRuleset: {
            reservedPlaces: null,
            participationSource: {
              type: 'round',
              roundId: '333-r1',
              resultCondition: {
                type: 'percent',
                scope: 'average',
                value: 75,
              },
            },
          },
          results: [],
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
    {
      id: '222',
      extensions: [],
      rounds: [
        {
          id: '222-r1',
          extensions: [],
          format: 'a',
          cutoff: null,
          timeLimit: null,
          linkedRounds: null,
          participationRuleset: null,
          results: [],
        },
        {
          id: '222-r2',
          extensions: [],
          format: 'a',
          cutoff: null,
          timeLimit: null,
          linkedRounds: null,
          participationRuleset: null,
          results: [],
        },
        {
          id: '222-r3',
          extensions: [],
          format: 'a',
          cutoff: null,
          timeLimit: null,
          linkedRounds: null,
          participationRuleset: {
            reservedPlaces: null,
            participationSource: {
              type: 'linkedRounds',
              roundIds: ['222-r1', '222-r2'],
              resultCondition: {
                type: 'ranking',
                scope: 'average',
                value: 8,
              },
            },
          },
          results: [],
        },
      ],
    },
  ],
};

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({
    competitionId: 'TestComp2026',
    wcif: wcifMock,
    setTitle: () => {},
  }),
}));

const cutoffOnlyRound: Round = {
  format: 'a',
  extensions: [],
  results: [],
  id: '333-r1',
  cutoff: {
    numberOfAttempts: 2,
    resultValue: 1200,
  },
  timeLimit: null,
  linkedRounds: null,
  participationRuleset: null,
};

function renderPanel(round: Round) {
  return render(
    <MemoryRouter>
      <CutoffTimeLimitPanel round={round} />
    </MemoryRouter>,
  );
}

describe('CutoffTimeLimitPanel', () => {
  it('uses theme-aware popover classes for help content', () => {
    renderPanel(cutoffOnlyRound);

    const helpButton = screen.getByRole('button', { name: /^help$/i, expanded: false });
    fireEvent.click(helpButton);
    expect(helpButton).toHaveAttribute('aria-expanded', 'true');

    const popoverContent = screen
      .getByText(/common\.cutoffTimeLimitPopover\.timeLimits/i)
      .closest('div');

    expect(popoverContent).toHaveClass('bg-panel');
    expect(popoverContent).toHaveClass('text-default');
    expect(popoverContent).not.toHaveClass('bg-white');

    fireEvent.click(helpButton);
    expect(helpButton).toHaveAttribute('aria-expanded', 'false');
    expect(popoverContent).not.toBeInTheDocument();
  });

  it('shows ranking advancement from the target round', () => {
    const nextRound = wcifMock.events[0].rounds[1];
    const originalRuleset = nextRound.participationRuleset;
    nextRound.participationRuleset = {
      reservedPlaces: null,
      participationSource: {
        type: 'round',
        roundId: '333-r1',
        resultCondition: { type: 'ranking', scope: 'average', value: 16 },
      },
    };

    try {
      renderPanel(wcifMock.events[0].rounds[0]);
      expect(screen.getByText('Top 16 advance to next round')).toBeInTheDocument();
    } finally {
      nextRound.participationRuleset = originalRuleset;
    }
  });

  it('shows advancement text derived from the next round participation ruleset', () => {
    renderPanel(wcifMock.events[0].rounds[0]);

    expect(screen.getByText('Top 75% advance to next round')).toBeInTheDocument();
  });

  it('shows linked-round advancement text when a later round depends on combined results', () => {
    renderPanel(wcifMock.events[0].rounds[1]);

    expect(screen.getByText('Top 12 in dual rounds 1 & 2 advance to final')).toBeInTheDocument();
  });

  it('shows the same dual-round advancement text for the first round in a linked-round set', () => {
    renderPanel(wcifMock.events[1].rounds[0]);

    expect(screen.getByText('Top 8 in dual rounds 1 & 2 advance to final')).toBeInTheDocument();
  });
});
