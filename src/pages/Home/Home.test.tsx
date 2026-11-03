import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { fetchSearchCompetition } from '@/lib/api';
import Home from './index';

jest.mock('@/lib/api', () => ({ fetchSearchCompetition: jest.fn() }));
jest.mock('@/providers/UserSettingsProvider', () => ({
  useUserSettings: () => ({ effectiveTheme: 'light' }),
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ user: {}, signIn: jest.fn() }) }));
jest.mock('@/containers/MyCompetitions', () => ({ MyCompetitions: () => null }));
jest.mock('@/containers/UpcomingCompetitions/UpcomingCompetitions', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/LoggedOutPromptCard', () => ({ LoggedOutPromptCard: () => null }));
function Competition() {
  const navigate = useNavigate();
  return (
    <>
      <p>Opened competition</p>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}
it('opens the selected competition with the keyboard, then supports Back and another selection', async () => {
  jest.mocked(fetchSearchCompetition).mockResolvedValue({
    result: [
      {
        id: 'Campulung2026',
        name: 'Campulung Moldovenesc Open 2026',
        start_date: '2026-10-31',
        end_date: '2026-10-31',
        country_iso2: 'RO',
        city: 'Campulung',
      } as ApiCompetition,
    ],
  });
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/competitions/Campulung2026" element={<Competition />} />
      </Routes>
    </MemoryRouter>,
  );
  await act(async () => {
    await userEvent.type(screen.getByRole('combobox'), 'Campulung');
  });
  await screen.findByText('Campulung Moldovenesc Open 2026');
  await act(async () => {
    await userEvent.keyboard('{ArrowDown}{Enter}');
  });
  expect(screen.getByText('Opened competition')).toBeInTheDocument();
  await act(async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
  });
  expect(screen.getByRole('combobox')).toHaveValue('');
  await act(async () => {
    await userEvent.type(screen.getByRole('combobox'), 'Campulung');
  });
  const option = await screen.findByText('Campulung Moldovenesc Open 2026');
  await act(async () => {
    await userEvent.click(option);
  });
  expect(screen.getByText('Opened competition')).toBeInTheDocument();
});
