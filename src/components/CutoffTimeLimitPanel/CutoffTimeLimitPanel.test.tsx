import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Round } from '@wca/helpers';
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

const wcifMock = {
  id: 'TestComp2026',
  schedule: { venues: [] },
  events: [
    {
      id: '333',
      rounds: [
        {
          id: '333-r1',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          advancementCondition: {
            type: 'ranking',
            level: 16,
          },
          results: [],
        },
        {
          id: '333-r2',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          participationRuleset: {
            participationSource: {
              type: 'round',
              roundId: '333-r1',
              resultCondition: {
                type: 'percent',
                value: 75,
              },
            },
          },
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
    {
      id: '222',
      rounds: [
        {
          id: '222-r1',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          results: [],
        },
        {
          id: '222-r2',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          results: [],
        },
        {
          id: '222-r3',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          participationRuleset: {
            participationSource: {
              type: 'linkedRounds',
              roundIds: ['222-r1', '222-r2'],
              resultCondition: {
                type: 'ranking',
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

const cutoffOnlyRound = {
  id: '333-r1',
  cutoff: {
    numberOfAttempts: 2,
    attemptResult: 1200,
  },
  timeLimit: null,
  advancementCondition: null,
} as unknown as Round;

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

    fireEvent.click(screen.getByRole('button', { name: /help/i }));

    const popoverContent = screen
      .getByText(/common\.cutoffTimeLimitPopover\.timeLimits/i)
      .closest('div');

    expect(popoverContent).toHaveClass('bg-panel');
    expect(popoverContent).toHaveClass('text-default');
    expect(popoverContent).not.toHaveClass('bg-white');
  });

  it('shows the legacy advancement text for stable wcif rounds', () => {
    renderPanel(wcifMock.events[0].rounds[0] as unknown as Round);

    expect(screen.getByText('Top 16 advance to next round')).toBeInTheDocument();
  });

  it('shows advancement text derived from the next round participation ruleset', () => {
    renderPanel({
      ...(wcifMock.events[0].rounds[0] as object),
      advancementCondition: null,
    } as Round);

    expect(screen.getByText('Top 75% advance to next round')).toBeInTheDocument();
  });

  it('shows linked-round advancement text when a later round depends on combined results', () => {
    renderPanel(wcifMock.events[0].rounds[1] as unknown as Round);

    expect(screen.getByText('Top 12 in dual rounds 1 & 2 advance to final')).toBeInTheDocument();
  });

  it('shows the same dual-round advancement text for the first round in a linked-round set', () => {
    renderPanel(wcifMock.events[1].rounds[0] as unknown as Round);

    expect(screen.getByText('Top 8 in dual rounds 1 & 2 advance to final')).toBeInTheDocument();
  });
});
