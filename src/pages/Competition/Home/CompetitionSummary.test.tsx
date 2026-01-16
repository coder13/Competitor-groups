import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CompetitionSummary } from './CompetitionSummary';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CompetitionSummary', () => {
  it('renders date range and venue name', () => {
    render(<CompetitionSummary startDate="2026-01-10" numberOfDays={3} venueName="City Hall" />);

    expect(screen.getByText('competition.home.summary.dates:')).toBeInTheDocument();
    expect(screen.getByText('competition.home.summary.venue:')).toBeInTheDocument();
    expect(screen.getByText('City Hall')).toBeInTheDocument();
  });
});
