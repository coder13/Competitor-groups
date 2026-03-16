import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CompetitionFacts } from './CompetitionFacts';

describe('CompetitionFacts', () => {
  it('renders date range, competitor limit, and website link', () => {
    render(<CompetitionFacts dateRange="Jan 10, 2026 - Jan 12, 2026" competitorLimit={150} />);

    expect(screen.getByText('Jan 10, 2026 - Jan 12, 2026')).toBeInTheDocument();
    expect(screen.getByText('Limit: 150')).toBeInTheDocument();
  });
});
