import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TabsDropdownList } from '../TabsDropdownList';

jest.mock('@/hooks/queries/useCompetitionTabs', () => ({
  useCompetitionTabLinks: jest.fn(),
}));

const mockUseCompetitionTabLinks = jest.requireMock('@/hooks/queries/useCompetitionTabs')
  .useCompetitionTabLinks as jest.Mock;

describe('TabsDropdownList', () => {
  it('renders competition tab links', () => {
    mockUseCompetitionTabLinks.mockReturnValue({
      data: [
        {
          href: '/competitions/Test2025/tabs#venue',
          text: 'Venue',
          slug: 'venue',
        },
      ],
    });

    render(
      <MemoryRouter>
        <TabsDropdownList competitionId="Test2025" onNavigate={() => {}} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Venue' });
    expect(link).toHaveAttribute('href', '/competitions/Test2025/tabs#venue');
  });

  it('returns null when no tabs exist', () => {
    mockUseCompetitionTabLinks.mockReturnValue({ data: [] });

    const { container } = render(
      <MemoryRouter>
        <TabsDropdownList competitionId="Test2025" onNavigate={() => {}} />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
