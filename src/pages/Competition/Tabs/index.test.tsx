import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CompetitionTabs from './index';

jest.mock('@/hooks/queries/useCompetitionTabs', () => ({
  useCompetitionTabs: jest.fn(),
}));

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: jest.fn(),
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockUseCompetitionTabs = jest.requireMock('@/hooks/queries/useCompetitionTabs')
  .useCompetitionTabs as jest.Mock;
const mockUseWCIF = jest.requireMock('@/providers/WCIFProvider').useWCIF as jest.Mock;

jest.mock('@/components/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <div>{content}</div>,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CompetitionTabs', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('renders markdown content for tabs', () => {
    mockUseWCIF.mockReturnValue({
      competitionId: 'LakewoodFall2025',
      wcif: undefined,
      setTitle: jest.fn(),
    });

    mockUseCompetitionTabs.mockReturnValue({
      data: [
        {
          id: 1,
          competition_id: 'LakewoodFall2025',
          name: 'Venue',
          content: '# Venue\n\nDetails and [link](https://example.com).',
          display_order: 1,
        },
      ],
      isLoading: false,
      error: null,
    } as UseQueryResult<ApiCompetitionTab[], Error>);

    render(
      <MemoryRouter>
        <CompetitionTabs />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'Venue' })).toBeInTheDocument();
    expect(screen.queryByText(/# Venue/)).not.toBeInTheDocument();
    expect(screen.getByText(/Details and/)).toBeInTheDocument();
  });

  it('stores accordion state per competition', async () => {
    mockUseWCIF.mockReturnValue({
      competitionId: 'LakewoodFall2025',
      wcif: undefined,
      setTitle: jest.fn(),
    });

    mockUseCompetitionTabs.mockReturnValue({
      data: [
        {
          id: 1,
          competition_id: 'LakewoodFall2025',
          name: 'Venue',
          content: 'Details',
          display_order: 1,
        },
      ],
      isLoading: false,
      error: null,
    } as UseQueryResult<ApiCompetitionTab[], Error>);

    render(
      <MemoryRouter>
        <CompetitionTabs />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Venue' }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'competition-tabs-open-LakewoodFall2025',
      JSON.stringify({ venue: false }),
    );
  });

  it('opens the tab linked by hash', () => {
    mockUseWCIF.mockReturnValue({
      competitionId: 'LakewoodFall2025',
      wcif: undefined,
      setTitle: jest.fn(),
    });

    mockUseCompetitionTabs.mockReturnValue({
      data: [
        {
          id: 1,
          competition_id: 'LakewoodFall2025',
          name: 'Venue',
          content: 'Details',
          display_order: 1,
        },
      ],
      isLoading: false,
      error: null,
    } as UseQueryResult<ApiCompetitionTab[], Error>);

    render(
      <MemoryRouter initialEntries={['/competitions/LakewoodFall2025/tabs#venue']}>
        <CompetitionTabs />
      </MemoryRouter>,
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
  });
});
