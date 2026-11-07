import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { fetchSearchCompetition } from '@/lib/api';
import { CompetitionSelect } from './CompetitionSelect';

jest.mock('@/lib/api', () => ({ fetchSearchCompetition: jest.fn() }));
jest.mock('@/providers/UserSettingsProvider', () => ({
  useUserSettings: () => ({ effectiveTheme: 'light' }),
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const competition = {
  id: 'Campulung2026',
  name: 'Campulung Moldovenesc Open 2026',
  start_date: '2026-10-31',
  end_date: '2026-10-31',
  country_iso2: 'RO',
  city: 'Campulung Moldovenesc',
} as ApiCompetition;
const mockSearch = jest.mocked(fetchSearchCompetition);
beforeEach(() => {
  jest.clearAllMocks();
  mockSearch.mockResolvedValue({ result: [competition] });
});

it('exposes a named combobox and real options with usable active-descendant IDs', async () => {
  render(<CompetitionSelect onSelect={jest.fn()} />, { wrapper: MemoryRouter });
  const input = screen.getByRole('combobox', { name: 'common.competitionSelect.placeholder' });
  await act(async () => {
    await userEvent.type(input, 'Campulung');
  });
  const option = await screen.findByRole('option', { name: /Campulung Moldovenesc Open 2026/ });
  await act(async () => {
    await userEvent.keyboard('{ArrowDown}');
  });
  expect(input).toHaveAttribute('aria-activedescendant', option.id);
  expect(option.id).not.toBe('');
  expect(option).toHaveAttribute('aria-selected', 'false');
  expect(option.querySelector('a')).toBeNull();
});

it.each(['keyboard', 'pointer'])('selects the same competition once by %s', async (method) => {
  const onSelect = jest.fn();
  render(<CompetitionSelect onSelect={onSelect} />, { wrapper: MemoryRouter });
  await act(async () => {
    await userEvent.type(screen.getByRole('combobox'), 'Campulung');
  });
  await screen.findByText(competition.name);
  if (method === 'keyboard')
    await act(async () => {
      await userEvent.keyboard('{ArrowDown}{Enter}');
    });
  else
    await act(async () => {
      await userEvent.click(screen.getByText(competition.name));
    });
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith(competition.id);
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox')).toHaveFocus();
});

it('dismisses with Escape and can search and select again without accidental navigation', async () => {
  const onSelect = jest.fn();
  render(<CompetitionSelect onSelect={onSelect} />, { wrapper: MemoryRouter });
  const input = screen.getByRole('combobox');
  await act(async () => {
    await userEvent.type(input, 'Campulung');
  });
  await screen.findByText(competition.name);
  await act(async () => {
    await userEvent.keyboard('{Escape}');
  });
  await act(async () => {
    await userEvent.keyboard('{Enter}');
  });
  expect(onSelect).not.toHaveBeenCalled();
  expect(input).toHaveFocus();
  await act(async () => {
    await userEvent.clear(input);
  });
  await act(async () => {
    await userEvent.type(input, 'Campulung');
  });
  await screen.findByRole('option');
  await act(async () => {
    await userEvent.keyboard('{ArrowDown}{Enter}');
  });
  expect(onSelect).toHaveBeenCalledWith(competition.id);
});

it('ignores a stale response after a newer query or after the search is cleared', async () => {
  let resolveOld!: (value: { result: ApiCompetition[] }) => void;
  mockSearch.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
  );
  const onSelect = jest.fn();
  render(<CompetitionSelect onSelect={onSelect} />, { wrapper: MemoryRouter });
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: 'Old' } });
  await waitFor(() => expect(mockSearch).toHaveBeenCalledWith('Old'));
  fireEvent.change(input, { target: { value: 'Campulung' } });
  await screen.findByText(competition.name);
  await act(async () =>
    resolveOld({ result: [{ ...competition, id: 'Old2026', name: 'Old competition' }] }),
  );
  expect(screen.queryByText('Old competition')).not.toBeInTheDocument();
  await act(async () => {
    await userEvent.clear(input);
  });
  expect(screen.queryByRole('option')).not.toBeInTheDocument();
  expect(onSelect).not.toHaveBeenCalled();
});

it('cancels an unstarted search when navigation unmounts the control', async () => {
  jest.useFakeTimers();
  try {
    const { unmount } = render(<CompetitionSelect onSelect={jest.fn()} />, {
      wrapper: MemoryRouter,
    });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Campulung' } });
    unmount();
    await act(async () => {
      jest.runAllTimers();
    });
    expect(mockSearch).not.toHaveBeenCalled();
  } finally {
    jest.useRealTimers();
  }
});
