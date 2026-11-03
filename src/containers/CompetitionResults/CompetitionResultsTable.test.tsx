import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Round, RoundFormat } from '@wca/helpers';
import { CompetitionResultsTable, CompetitionRoundResult } from './CompetitionResultsTable';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key.split('.').pop() }),
}));

const makeResult = (overrides: Partial<CompetitionRoundResult> = {}): CompetitionRoundResult => ({
  id: 1,
  personId: null,
  personName: 'Competitor One',
  ranking: 1,
  advancing: false,
  advancingQuestionable: false,
  attempts: [{ result: 35 }, { result: -1 }, { result: 31 }],
  best: 31,
  average: -1,
  ...overrides,
});

function renderTable(eventId: string, format: RoundFormat, results: CompetitionRoundResult[]) {
  const round: Round = {
    id: `${eventId}-r1`,
    format,
    cutoff: null,
    timeLimit: null,
    linkedRounds: null,
    participationRuleset: null,
    extensions: [],
    results: [],
  };

  return render(
    <CompetitionResultsTable
      competitionId="Test2026"
      eventId={eventId}
      round={round}
      persons={[]}
      results={results}
    />,
  );
}

describe('CompetitionResultsTable', () => {
  it.each([-1, -2])('renders FMC sentinel %s in attempts, means, bests and details', (value) => {
    renderTable('333fm', 'm', [
      makeResult({ attempts: [{ result: value }], best: value, average: value }),
    ]);
    const label = value === -1 ? 'DNF' : 'DNS';
    const row = screen.getAllByRole('row')[1];
    expect(within(row).getAllByText(label)).toHaveLength(3);
    expect(row).not.toHaveTextContent('-0.0');

    fireEvent.click(row);
    expect(within(screen.getByRole('dialog')).getAllByText(label)).toHaveLength(3);
  });

  it('preserves FMC zero, missing attempts and roster-only blank cells', () => {
    renderTable('333fm', 'm', [
      makeResult({ attempts: [{ result: 0 }], best: 0, average: 0 }),
      makeResult({ id: 2, personName: 'Competitor Two' }),
      makeResult({
        id: 3,
        personName: 'Roster Only',
        ranking: null,
        attempts: [],
        best: 0,
        average: 0,
      }),
    ]);
    const row = screen.getByRole('row', { name: /Competitor One/ });
    expect(
      within(row)
        .getAllByRole('cell')
        .slice(2)
        .map((cell) => cell.textContent),
    ).toEqual(['-', '-', '-', '-', '-']);
    const roster = screen.getByRole('row', { name: /Roster Only/ });
    expect(
      within(roster)
        .getAllByRole('cell')
        .filter((_, index) => index !== 1)
        .every((cell) => cell.textContent === ''),
    ).toBe(true);

    fireEvent.click(row);
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.queryByText('attempts')).not.toBeInTheDocument();
    expect(dialog.queryByText('best')).not.toBeInTheDocument();
    expect(dialog.queryByText('average')).not.toBeInTheDocument();
  });

  it.each<RoundFormat>(['1', '2', '3'])('shows one Best column for best-of-%s rounds', (format) => {
    const { container } = renderTable('333mbf', format, [
      makeResult({
        attempts: [{ result: 970060000 }, { result: -1 }],
        best: 970060000,
        average: 0,
        singleRecordTag: 'NR',
      }),
    ]);

    expect(screen.getAllByRole('columnheader', { name: 'best' })).toHaveLength(1);
    expect(screen.queryByRole('columnheader', { name: 'average' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(5);
    expect(container.querySelectorAll('col')).toHaveLength(5);
    expect(within(screen.getAllByRole('row')[1]).getAllByRole('cell')).toHaveLength(5);
    expect(screen.getAllByText('2/2 10:00')).toHaveLength(2);
    expect(screen.getByLabelText('NR record')).toBeInTheDocument();
  });

  it.each<RoundFormat>(['a', 'm'])('keeps average and Best columns for format %s', (format) => {
    const { container } = renderTable('333fm', format, [makeResult({ average: 3300 })]);
    expect(screen.getAllByRole('columnheader', { name: 'best' })).toHaveLength(1);
    expect(screen.getByRole('columnheader', { name: 'average' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(container.querySelectorAll('col')).toHaveLength(7);
    expect(within(screen.getAllByRole('row')[1]).getAllByRole('cell')).toHaveLength(7);
    expect(screen.getByText('33.00')).toBeInTheDocument();
  });
});
