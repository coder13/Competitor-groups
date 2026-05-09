import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Competition } from '@wca/helpers';
import { MemoryRouter } from 'react-router-dom';
import { AnchorLink } from '@/lib/linkRenderer';
import { CompetitionPersonalResultsContainer } from './CompetitionPersonalResults';

jest.mock('@/components/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/lib/events', () => ({
  getEventName: (eventId: string) => (eventId === '333' ? '3x3x3 Cube' : '4x4x4 Cube'),
}));

jest.mock('@/hooks/UsePinnedPersons', () => ({
  usePinnedPersons: () => ({
    pinnedPersons: [],
    pinPerson: jest.fn(),
    unpinPerson: jest.fn(),
  }),
}));

jest.mock('country-flag-icons', () => ({
  hasFlag: () => true,
}));

jest.mock('country-flag-icons/unicode', () => ({
  __esModule: true,
  default: () => '🇺🇸',
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'competition.results.title') return 'Results';
      if (key === 'competition.results.noResults') return 'No results yet.';
      if (key === 'competition.results.rank') return '#';
      if (key === 'competition.results.average') return 'Avg';
      if (key === 'competition.results.best') return 'Best';
      if (key === 'competition.personalResults.eventResults') return 'Event results';
      if (key === 'competition.personalSchedule.schedule') return 'Schedule';
      if (key === 'competition.personalSchedule.results') return 'Results';
      if (key === 'competition.personalSchedule.records') return 'Records';
      if (key === 'common.wca.round') return 'Round';
      if (key === 'common.activityCodeToName.round') return `Round ${options?.roundNumber}`;

      return key;
    },
  }),
}));

const wcifMock = {
  id: 'TestComp2026',
  persons: [
    {
      registrantId: 1,
      name: 'Vikram Haldar',
      wcaUserId: 1001,
      wcaId: '2010HALD01',
      countryIso2: 'US',
      registration: null,
      extensions: [],
    },
  ],
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
              ranking: 2,
              attempts: [
                { result: 690, reconstruction: null },
                { result: 732, reconstruction: null },
                { result: 786, reconstruction: null },
                { result: 1034, reconstruction: null },
                { result: 705, reconstruction: null },
              ],
              best: 690,
              average: 741,
            },
          ],
          extensions: [],
        },
      ],
    },
    {
      id: '444',
      extensions: [],
      rounds: [
        {
          id: '444-r1',
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
} as unknown as Competition;

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({
    competitionId: 'TestComp2026',
    wcif: wcifMock,
    setTitle: () => {},
  }),
}));

function renderPersonalResults(registrantId = '1') {
  return render(
    <MemoryRouter>
      <CompetitionPersonalResultsContainer registrantId={registrantId} LinkComponent={AnchorLink} />
    </MemoryRouter>,
  );
}

describe('CompetitionPersonalResultsContainer', () => {
  it('shows event tables for the selected competitor results', () => {
    renderPersonalResults();

    expect(screen.getByText('Vikram Haldar')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('3x3x3 Cube')).toBeInTheDocument();
    expect(screen.queryByText('4x4x4 Cube')).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Event results' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '1' })).toHaveClass('hidden', 'md:table-cell');
    expect(screen.getByRole('link', { name: 'Round 1' })).toHaveAttribute(
      'href',
      '/competitions/TestComp2026/results/333-r1',
    );
    expect(screen.getByText('7.41')).toBeInTheDocument();
    expect(screen.getAllByText('6.90')).toHaveLength(2);
  });

  it('renders nothing when the person cannot be found', () => {
    const { container } = renderPersonalResults('2');

    expect(container).toBeEmptyDOMElement();
  });
});
