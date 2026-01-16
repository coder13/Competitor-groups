import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CompetitionHomeHeader } from './CompetitionHomeHeader';

jest.mock('@/components/PinCompetitionButton', () => ({
  PinCompetitionButton: ({ competitionId }: { competitionId: string }) => (
    <div>Pin {competitionId}</div>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CompetitionHomeHeader', () => {
  it('renders summary and pin button', () => {
    render(
      <CompetitionHomeHeader
        competitionId="TestComp"
        startDate="2026-01-10"
        numberOfDays={2}
        venueName="City Hall"
      />,
    );

    expect(screen.getByText('Pin TestComp')).toBeInTheDocument();
    expect(screen.getByText('competition.home.summary.dates:')).toBeInTheDocument();
    expect(screen.getByText('competition.home.summary.venue:')).toBeInTheDocument();
    expect(screen.getByText('City Hall')).toBeInTheDocument();
  });
});
