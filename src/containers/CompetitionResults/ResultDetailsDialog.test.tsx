import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Person, Round } from '@wca/helpers';
import { StrictMode } from 'react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { CompetitionPersonalResultsTable } from '@/containers/CompetitionPersonalResults/CompetitionPersonalResultsTable';
import { CompetitionResultsTable, CompetitionRoundResult } from './CompetitionResultsTable';
import { ResultDetailsDialog } from './ResultDetailsDialog';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'common.close': 'Close',
        'competition.results.allResults': 'All results',
      })[key] ?? key,
  }),
}));

const persons = [
  { registrantId: 1, name: 'Competitor One' },
  { registrantId: 2, name: 'Competitor Two' },
] as Person[];
const results: CompetitionRoundResult[] = persons.map((person, index) => ({
  id: index + 1,
  personId: person.registrantId,
  ranking: index + 1,
  attempts: [{ result: 1200 }],
  best: 1200,
  average: 1300,
  advancing: false,
  advancingQuestionable: false,
}));
const round = { id: '333-r1', format: 'a', results: [] } as unknown as Round;
const table = (roundId = '333-r1') => (
  <CompetitionResultsTable
    competitionId="Test"
    eventId="333"
    round={{ ...round, id: roundId }}
    persons={persons}
    results={results}
    LinkComponent={Link}
  />
);

async function openRow(name = 'Competitor One', key = '{Enter}') {
  const row = screen.getByRole('row', { name: new RegExp(name) });
  act(() => row.focus());
  await act(() => userEvent.keyboard(key));
  return row;
}

it('opens a named dialog, moves focus inside and traps forward/backward tabbing', async () => {
  render(<MemoryRouter>{table()}</MemoryRouter>);
  const row = await openRow();
  const dialog = screen.getByRole('dialog', { name: 'Competitor One #1' });
  const close = within(dialog).getByRole('button', { name: 'Close' });
  const link = within(dialog).getByRole('link', { name: 'All results' });
  expect(close).toHaveFocus();
  await act(() => userEvent.tab());
  expect(link).toHaveFocus();
  await act(() => userEvent.tab({ shift: true }));
  expect(close).toHaveFocus();
  await act(() => userEvent.tab({ shift: true }));
  expect(link).toHaveFocus();
  await act(() => userEvent.tab());
  expect(close).toHaveFocus();
  // A programmatic focus escape is also redirected while the modal is open.
  act(() => row.focus());
  expect(close).toHaveFocus();
});

it.each(['Close', 'Escape', 'backdrop'])(
  'restores the invoking row after %s and repeated opening',
  async (dismissal) => {
    render(
      <MemoryRouter>
        <StrictMode>{table()}</StrictMode>
      </MemoryRouter>,
    );
    const row = await openRow();
    const dialog = screen.getByRole('dialog');
    if (dismissal === 'Close')
      await act(() => userEvent.click(within(dialog).getByRole('button', { name: 'Close' })));
    else if (dismissal === 'Escape') await act(() => userEvent.keyboard('{Escape}'));
    else await act(() => userEvent.click(dialog));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(row).toHaveFocus();
    const secondRow = await openRow('Competitor Two', ' ');
    expect(screen.getByRole('dialog', { name: 'Competitor Two #2' })).toBeInTheDocument();
    await act(() => userEvent.keyboard('{Escape}'));
    expect(secondRow).toHaveFocus();
  },
);

it('keeps a single Close control focused and uses the latest close callback without resetting focus', async () => {
  const firstClose = jest.fn();
  const nextClose = jest.fn();
  const props = {
    competitionId: 'Test',
    eventId: '333',
    name: 'One',
    primaryRankingType: 'average' as const,
    result: results[0],
  };
  const { rerender, unmount } = render(<ResultDetailsDialog {...props} onClose={firstClose} />);
  const close = screen.getByRole('button', { name: 'Close' });
  expect(close).toHaveFocus();
  await act(() => userEvent.tab());
  expect(close).toHaveFocus();
  await act(() => userEvent.tab({ shift: true }));
  expect(close).toHaveFocus();
  rerender(<ResultDetailsDialog {...props} onClose={nextClose} />);
  await act(() => userEvent.keyboard('{Escape}'));
  expect(nextClose).toHaveBeenCalledTimes(1);
  expect(firstClose).not.toHaveBeenCalled();
  unmount();
  const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  document.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
});

it('releases focus and listeners on link navigation rather than restoring a removed row', async () => {
  render(
    <MemoryRouter initialEntries={['/competitions/Test/results/333-r1']}>
      <Routes>
        <Route path="/competitions/Test/results/:roundId" element={table()} />
        <Route
          path="/competitions/Test/persons/1/results"
          element={<button>Personal page action</button>}
        />
      </Routes>
    </MemoryRouter>,
  );
  const row = await openRow();
  const link = within(screen.getByRole('dialog')).getByRole('link', { name: 'All results' });
  act(() => link.focus());
  await act(() => userEvent.keyboard('{Enter}'));
  expect(screen.getByRole('button', { name: 'Personal page action' })).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(row.isConnected).toBe(false);
  await act(() => userEvent.tab());
  expect(screen.getByRole('button', { name: 'Personal page action' })).toHaveFocus();
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  document.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
});

it('dismisses a stale selection on a round change and does not reopen it on Back', async () => {
  const { rerender } = render(<MemoryRouter>{table()}</MemoryRouter>);
  await openRow();
  rerender(<MemoryRouter>{table('333-r2')}</MemoryRouter>);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  rerender(<MemoryRouter>{table()}</MemoryRouter>);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('applies the same focus lifecycle and person isolation to personal result tables', async () => {
  const personalTable = (person: Person) => (
    <CompetitionPersonalResultsTable
      competitionId="Test"
      eventId="333"
      eventName="3x3x3 Cube"
      person={person}
      LinkComponent={Link}
      roundResults={[
        {
          roundId: '333-r1',
          roundName: 'Round 1',
          roundNumber: 1,
          ranking: 1,
          attempts: [{ result: 1200 }],
          best: 1200,
          average: 1300,
          advancing: false,
          advancingQuestionable: false,
        },
      ]}
    />
  );
  const { rerender } = render(<MemoryRouter>{personalTable(persons[0])}</MemoryRouter>);
  const row = screen.getByRole('row', { name: /Round 1/ });
  act(() => row.focus());
  await act(() => userEvent.keyboard('{Enter}'));
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAccessibleName();
  expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
  await act(() => userEvent.tab());
  expect(within(dialog).getByRole('link', { name: 'All results' })).toHaveFocus();
  await act(() => userEvent.keyboard('{Escape}'));
  expect(row).toHaveFocus();
  fireEvent.click(row);
  rerender(<MemoryRouter>{personalTable(persons[1])}</MemoryRouter>);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('keeps focus through live prop updates, calls the latest callback and restores the original opener', async () => {
  const opener = document.createElement('button');
  opener.textContent = 'Original opener';
  document.body.appendChild(opener);
  opener.focus();
  const firstClose = jest.fn();
  const nextClose = jest.fn();
  const props = {
    competitionId: 'Test',
    eventId: '333',
    name: 'Competitor One',
    person: persons[0],
    primaryRankingType: 'average' as const,
    result: results[0],
  };
  const { rerender, unmount } = render(
    <MemoryRouter>
      <ResultDetailsDialog {...props} onClose={firstClose} />
    </MemoryRouter>,
  );
  const link = within(screen.getByRole('dialog')).getByRole('link', { name: 'All results' });
  act(() => link.focus());
  rerender(
    <MemoryRouter>
      <ResultDetailsDialog
        {...props}
        name="Updated competitor"
        result={{ ...results[0], ranking: 2 }}
        onClose={nextClose}
      />
    </MemoryRouter>,
  );
  expect(screen.getByRole('dialog', { name: 'Updated competitor #2' })).toBeInTheDocument();
  expect(link).toHaveFocus();
  await act(() => userEvent.keyboard('{Escape}'));
  expect(nextClose).toHaveBeenCalledTimes(1);
  expect(firstClose).not.toHaveBeenCalled();
  await act(async () => unmount());
  expect(opener).toHaveFocus();
  opener.remove();
});

it('restores a pointer-invoked row even when the click did not focus the row', async () => {
  render(<MemoryRouter>{table()}</MemoryRouter>);
  const row = screen.getByRole('row', { name: /Competitor Two/ });
  fireEvent.click(row);
  expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  await act(() => userEvent.click(screen.getByRole('button', { name: 'Close' })));
  expect(row).toHaveFocus();
});

it('does not steal focus from a replacement screen during unmount cleanup', async () => {
  const opener = document.createElement('button');
  const replacement = document.createElement('button');
  document.body.append(opener, replacement);
  opener.focus();
  const { unmount } = render(
    <ResultDetailsDialog
      competitionId="Test"
      eventId="333"
      name="One"
      primaryRankingType="average"
      result={results[0]}
      onClose={jest.fn()}
    />,
  );
  await act(async () => {
    unmount();
    replacement.focus();
  });
  expect(replacement).toHaveFocus();
  opener.remove();
  replacement.remove();
});

it('refreshes an open competition modal from current results while retaining focus and source-independent row identity', async () => {
  const liveTable = (currentResults: CompetitionRoundResult[]) => (
    <MemoryRouter>
      <CompetitionResultsTable
        competitionId="Test"
        eventId="333"
        round={round}
        persons={persons}
        results={currentResults}
        LinkComponent={Link}
      />
    </MemoryRouter>
  );
  const { rerender } = render(liveTable(results));
  const row = await openRow();
  const link = within(screen.getByRole('dialog')).getByRole('link', { name: 'All results' });
  act(() => link.focus());
  // The result source changes its ID, but this is still the same registered person.
  const refreshed = [
    {
      ...results[0],
      id: 'live-result-1',
      ranking: 2,
      attempts: [{ result: 900 }],
      best: 900,
      average: 1000,
    },
    results[1],
  ];
  rerender(liveTable(refreshed));
  const dialog = screen.getByRole('dialog', { name: 'Competitor One #2' });
  expect(within(dialog).getByText('10.00')).toBeInTheDocument();
  expect(within(dialog).getAllByText('9.00')).toHaveLength(2);
  expect(within(dialog).queryByText('13.00')).not.toBeInTheDocument();
  expect(link).toHaveFocus();
  expect(screen.getByRole('row', { name: /Competitor One/ })).toBe(row);
  expect(row).toHaveTextContent('10.00');
  await act(() => userEvent.keyboard('{Escape}'));
  expect(row).toHaveFocus();
});

it('dismisses a removed competition result without reopening it when results return', async () => {
  const liveTable = (currentResults: CompetitionRoundResult[]) => (
    <MemoryRouter>
      <CompetitionResultsTable
        competitionId="Test"
        eventId="333"
        round={round}
        persons={persons}
        results={currentResults}
        LinkComponent={Link}
      />
    </MemoryRouter>
  );
  const { rerender } = render(liveTable(results));
  const row = await openRow();
  rerender(liveTable([results[1]]));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(row.isConnected).toBe(false);
  rerender(liveTable(results));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  document.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
});

it('refreshes and removes an open personal round modal from current round results', async () => {
  const initial = [
    {
      roundId: '333-r1',
      roundName: 'Round 1',
      roundNumber: 1,
      ranking: 1,
      attempts: [{ result: 1200 }],
      best: 1200,
      average: 1300,
      advancing: false,
      advancingQuestionable: false,
    },
  ];
  const personalTable = (currentResults: typeof initial) => (
    <MemoryRouter>
      <CompetitionPersonalResultsTable
        competitionId="Test"
        eventId="333"
        eventName="3x3x3 Cube"
        person={persons[0]}
        roundResults={currentResults}
        LinkComponent={Link}
      />
    </MemoryRouter>
  );
  const { rerender } = render(personalTable(initial));
  const row = screen.getByRole('row', { name: /Round 1/ });
  act(() => row.focus());
  await act(() => userEvent.keyboard('{Enter}'));
  const link = within(screen.getByRole('dialog')).getByRole('link', { name: 'All results' });
  act(() => link.focus());
  const refreshed = [
    { ...initial[0], ranking: 2, attempts: [{ result: 900 }], best: 900, average: 1000 },
  ];
  rerender(personalTable(refreshed));
  const dialog = screen.getByRole('dialog', { name: 'Competitor One · 3x3x3 Cube · Round 1 #2' });
  expect(within(dialog).getByText('10.00')).toBeInTheDocument();
  expect(within(dialog).getAllByText('9.00')).toHaveLength(2);
  expect(within(dialog).queryByText('13.00')).not.toBeInTheDocument();
  expect(link).toHaveFocus();
  await act(() => userEvent.keyboard('{Escape}'));
  expect(row).toHaveFocus();
  await act(() => userEvent.keyboard('{Enter}'));
  rerender(personalTable([]));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  rerender(personalTable(refreshed));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
