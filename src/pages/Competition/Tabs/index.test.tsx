import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CompetitionTabs from './index';

jest.mock('@/hooks/queries/useCompetitionTabs', () => ({
  useCompetitionTabs: jest.fn(),
}));

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: jest.fn(),
}));

jest.mock('remark-gfm', () => () => undefined);

const mockUseCompetitionTabs = jest.requireMock('@/hooks/queries/useCompetitionTabs')
  .useCompetitionTabs as jest.Mock;
const mockUseWCIF = jest.requireMock('@/providers/WCIFProvider').useWCIF as jest.Mock;

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({
    children,
    components,
  }: {
    children?: React.ReactNode;
    components?: {
      a?: ({ href, children }: { href?: string; children: React.ReactNode }) => JSX.Element;
    };
  }) => (
    <div>
      {children}
      {components?.a?.({ href: 'https://example.com', children: 'Example Link' })}
    </div>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CompetitionTabs', () => {
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

    expect(screen.getByRole('heading', { name: 'Venue' })).toBeInTheDocument();
    expect(screen.queryByText(/# Venue/)).not.toBeInTheDocument();
    expect(screen.getByText(/Details and/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Example Link' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
});
