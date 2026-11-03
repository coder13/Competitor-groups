import { fireEvent, render, screen } from '@testing-library/react';
import { Competition, Person } from '@wca/helpers';
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Competitors } from './Competitors';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/hooks/UsePinnedPersons', () => ({ usePinnedPersons: () => ({ pinnedPersons: [] }) }));
jest.mock('@/hooks/useOngoingActivities', () => ({
  useOngoingActivities: () => ({ ongoingActivities: [] }),
}));
jest.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ user: null }) }));
jest.mock('./CompetitorListItem', () => ({
  CompetitorListItem: ({ person }: { person: Person }) => (
    <li>
      <Link to={`persons/${person.registrantId}`}>{person.name}</Link>
    </li>
  ),
}));

const wcif = {
  persons: [
    {
      name: 'Raphaël Sauge',
      registrantId: 1,
      wcaUserId: 1,
      registration: { status: 'accepted', eventIds: ['333'] },
    },
    {
      name: 'Tin Huang',
      registrantId: 2,
      wcaUserId: 2,
      registration: { status: 'accepted', eventIds: ['333'] },
    },
  ],
} as Competition;

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
      <output data-testid="location">
        {location.pathname}
        {location.search}
      </output>
    </>
  );
}

function renderCompetition(initialPath = '/competitions/Test2026') {
  return render(
    <MemoryRouter initialEntries={['/', initialPath]} initialIndex={1}>
      <Navigation />
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/competitions/:competitionId" element={<Competitors wcif={wcif} />} />
        <Route
          path="/competitions/:competitionId/persons/:id"
          element={<div>Person schedule</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

it('restores the filtered list on Back and supports Forward without keystroke history entries', () => {
  renderCompetition();
  fireEvent.change(screen.getByRole('searchbox', { name: 'common.search' }), {
    target: { value: 'Raphaël' },
  });
  expect(screen.queryByRole('link', { name: 'Tin Huang' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Raphaël Sauge' }));
  expect(screen.getByText('Person schedule')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Back'));
  expect(screen.getByRole('searchbox')).toHaveValue('Raphaël');
  expect(screen.queryByRole('link', { name: 'Tin Huang' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Forward'));
  expect(screen.getByText('Person schedule')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Back'));
  fireEvent.click(screen.getByText('Back'));
  expect(screen.getByText('Home')).toBeInTheDocument();
});

it('reads direct-link search, preserves other params and removes search when cleared', () => {
  renderCompetition('/competitions/Test2026?search=Tin&other=kept');
  expect(screen.getByRole('searchbox')).toHaveValue('Tin');
  expect(screen.queryByRole('link', { name: 'Raphaël Sauge' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
  expect(screen.getAllByRole('link')).toHaveLength(2);
  expect(screen.getByTestId('location')).toHaveTextContent('/competitions/Test2026?other=kept');
});

it('renders no unpinned competitors for a search with no match', () => {
  renderCompetition('/competitions/Test2026?search=unknown');
  expect(screen.queryAllByRole('link')).toHaveLength(0);
});
