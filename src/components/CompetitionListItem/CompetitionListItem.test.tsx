import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CompetitionListItem } from './CompetitionListItem';

const baseProps = {
  id: '123',
  name: 'Test Competition',
  start_date: '2024-01-01',
  end_date: '2024-01-02',
  country_iso2: 'US',
  city: 'New York',
  isLive: false,
  isBookmarked: false,
};

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, {
    wrapper: MemoryRouter,
  });
}

describe('CompetitionListItem', () => {
  it('renders with all props (live and bookmarked)', () => {
    const { baseElement } = renderWithRouter(
      <CompetitionListItem {...baseProps} isLive={true} isBookmarked={true} />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('renders with only isLive true', () => {
    renderWithRouter(<CompetitionListItem {...baseProps} isLive={true} isBookmarked={false} />);
    expect(screen.getByRole('listitem').querySelector('.fa-tower-broadcast')).toBeInTheDocument();
    expect(screen.getByRole('listitem').querySelector('.fa-bookmark')).not.toBeInTheDocument();
  });

  it('renders with only isBookmarked true', () => {
    renderWithRouter(<CompetitionListItem {...baseProps} isLive={false} isBookmarked={true} />);
    expect(screen.getByRole('listitem').querySelector('.fa-bookmark')).toBeInTheDocument();
    expect(
      screen.getByRole('listitem').querySelector('.fa-tower-broadcast'),
    ).not.toBeInTheDocument();
  });

  it('renders with neither isLive nor isBookmarked', () => {
    renderWithRouter(<CompetitionListItem {...baseProps} isLive={false} isBookmarked={false} />);
    expect(
      screen.getByRole('listitem').querySelector('.fa-tower-broadcast'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('listitem').querySelector('.fa-bookmark')).not.toBeInTheDocument();
  });

  it('shows flag if country_iso2 is valid', () => {
    renderWithRouter(<CompetitionListItem {...baseProps} />);
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
  });

  it('applies opacity-50 class if competition is in the past', () => {
    const pastProps = {
      ...baseProps,
      end_date: '2000-01-01',
    };
    renderWithRouter(<CompetitionListItem {...pastProps} />);
    expect(screen.getByRole('listitem').className).toMatch(/opacity-50/);
  });

  it('matches snapshot (default)', () => {
    const { baseElement } = renderWithRouter(<CompetitionListItem {...baseProps} />);
    expect(baseElement).toMatchSnapshot();
  });
});
