import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Competition } from '@wca/helpers';
import { AnchorLink } from '@/lib/linkRenderer';
import { CompetitionResultsContainer } from './CompetitionResults';

jest.mock('@/components/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/lib/events', () => ({
  getEventName: (eventId: string) => (eventId === '333' ? '3x3x3 Cube' : eventId),
  getAllEvents: (wcif: Competition) => wcif.events,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'competition.results.title') return 'Results';
      if (key === 'competition.results.selectRound') return 'Select a round';
      if (key === 'competition.results.roundNotFound') return 'Round not found.';
      if (key === 'competition.results.back') return 'Back';
      if (key === 'competition.results.noResults') return 'No results yet.';
      if (key === 'competition.results.rank') return '#';
      if (key === 'competition.results.competitor') return 'Competitor';
      if (key === 'competition.results.average') return 'Avg';
      if (key === 'competition.results.best') return 'Best';
      if (key === 'competition.results.attempts') return 'Attempts';
      if (key === 'competition.results.unknownCompetitor') {
        return `Competitor #${options?.personId}`;
      }
      if (key === 'common.wca.event') return 'Event';
      if (key === 'common.wca.round') return 'Round';
      if (key === 'common.view') return 'View';
      if (key === 'common.activityCodeToName.round') return `Round ${options?.roundNumber}`;

      return key;
    },
  }),
}));

const wcifMock = {
  formatVersion: '1.0',
  id: 'TestComp2026',
  name: 'Test Competition 2026',
  shortName: 'Test Comp 2026',
  persons: [
    {
      registrantId: 1,
      name: 'Blake Thompson',
      wcaUserId: 1001,
      wcaId: '2010THOM03',
      countryIso2: 'US',
      registration: null,
      extensions: [],
    },
    {
      registrantId: 2,
      name: 'Nick Silvestri',
      wcaUserId: 1002,
      wcaId: '2016SILV08',
      countryIso2: 'US',
      registration: null,
      extensions: [],
    },
  ],
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
          results: [
            {
              personId: 1,
              ranking: 1,
              attempts: [
                { result: 1200, reconstruction: null },
                { result: 1300, reconstruction: null },
                { result: 1400, reconstruction: null },
              ],
              best: 1200,
              average: 1300,
            },
            {
              personId: 2,
              ranking: 2,
              attempts: [
                { result: 1400, reconstruction: null },
                { result: 1500, reconstruction: null },
                { result: 1600, reconstruction: null },
              ],
              best: 1400,
              average: 1500,
            },
          ],
          extensions: [],
        },
        {
          id: '333-r2',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          advancementCondition: null,
          results: [],
          extensions: [],
        },
      ],
    },
    {
      id: '222',
      extensions: [],
      rounds: [
        {
          id: '222-r1',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          advancementCondition: null,
          results: [],
          extensions: [],
        },
        {
          id: '222-r2',
          format: 'a',
          cutoff: null,
          timeLimit: null,
          advancementCondition: null,
          results: [],
          extensions: [],
        },
      ],
    },
  ],
  schedule: {
    numberOfDays: 1,
    startDate: '2026-05-03',
    venues: [],
  },
} as unknown as Competition;

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({
    competitionId: 'TestComp2026',
    wcif: wcifMock,
    setTitle: () => {},
  }),
}));

function renderResults(selectedRoundId?: string) {
  return render(
    <CompetitionResultsContainer
      competitionId="TestComp2026"
      selectedRoundId={selectedRoundId}
      LinkComponent={AnchorLink}
    />,
  );
}

describe('CompetitionResultsContainer', () => {
  it('shows the round chooser without selected round content by default', () => {
    renderResults();

    expect(screen.queryByText('Results')).not.toBeInTheDocument();
    expect(screen.queryByText('Select a round')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(
      screen.getAllByRole('link', { name: 'Round 1' }).map((link) => link.getAttribute('href')),
    ).toEqual([
      '/competitions/TestComp2026/results/333-r1',
      '/competitions/TestComp2026/results/222-r1',
    ]);
    expect(screen.getAllByText('3x3x3 Cube')).toHaveLength(1);
    expect(screen.getAllByText('222')).toHaveLength(1);
    expect(screen.queryByRole('link', { name: 'Round 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Results' })).not.toBeInTheDocument();
  });

  it('shows the selected round results table', () => {
    renderResults('333-r1');

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/competitions/TestComp2026/results',
    );
    expect(screen.getByText('3x3x3 Cube Round 1')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Results' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Competitor' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '1' })).toHaveClass('hidden', 'md:table-cell');
    expect(screen.getByRole('columnheader', { name: 'Avg' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Best' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Blake Thompson' })).toHaveAttribute(
      'href',
      '/competitions/TestComp2026/persons/1',
    );
    expect(screen.getByRole('link', { name: 'Nick Silvestri' })).toHaveAttribute(
      'href',
      '/competitions/TestComp2026/persons/2',
    );
    expect(screen.queryByText('2010THOM03')).not.toBeInTheDocument();
    expect(screen.getAllByText('13.00')).toHaveLength(2);
    expect(screen.getAllByText('12.00')).toHaveLength(2);
    expect(screen.queryByLabelText('Attempts')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Round 1' })).not.toBeInTheDocument();
  });

  it('shows a not-found state for an invalid round id', () => {
    renderResults('333-r9');

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/competitions/TestComp2026/results',
    );
    expect(screen.getByText('Round not found.')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('does not show the selected round scaffold for a round with no result rows', () => {
    renderResults('333-r2');

    expect(screen.getByText('Round not found.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Round 2' })).not.toBeInTheDocument();
  });

  it('shows round one for an event even before it has results', () => {
    renderResults('222-r1');

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/competitions/TestComp2026/results',
    );
    expect(screen.getByText('222 Round 1')).toBeInTheDocument();
    expect(screen.getByText('No results yet.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Round 1' })).not.toBeInTheDocument();
  });
});
