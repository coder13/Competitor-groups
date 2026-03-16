import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CompetitionBottomTabs } from '../CompetitionBottomTabs';

describe('CompetitionBottomTabs', () => {
  const tabs = [
    { href: '/competitions/1', text: 'Groups' },
    { href: '/competitions/1/events', text: 'Events' },
  ];

  it('renders tabs and the more button', async () => {
    const handleMore = jest.fn();

    render(
      <MemoryRouter>
        <CompetitionBottomTabs
          tabs={tabs}
          onOpenMore={handleMore}
          moreLabel="More tabs"
          isMoreOpen={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Groups' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Events' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More tabs' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'More tabs' }));
    expect(handleMore).toHaveBeenCalledTimes(1);
  });

  it('highlights the active tab', () => {
    render(
      <MemoryRouter initialEntries={['/competitions/1']}>
        <CompetitionBottomTabs
          tabs={tabs}
          onOpenMore={() => {}}
          moreLabel="More"
          isMoreOpen={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Groups' })).toHaveClass('border-t-blue-600');
  });
});
