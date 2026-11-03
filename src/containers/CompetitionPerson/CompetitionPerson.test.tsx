import { fireEvent, render, screen } from '@testing-library/react';
import { Competition, Person } from '@wca/helpers';
import { MemoryRouter, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { WCIFContext } from '@/providers/WCIFProvider';
import { CompetitionPersonContainer } from './CompetitionPerson';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/containers/CompetitionPersonalResults', () => ({
  CompetitionPersonalResultsContent: () => <div>Person results</div>,
}));
jest.mock('@/containers/PersonalBests', () => ({
  PersonalBestsContainer: () => <div>Person records</div>,
}));
jest.mock('@/containers/PersonalSchedule', () => ({
  PersonalScheduleContent: () => <div>Person schedule</div>,
}));
jest.mock('@/containers/PersonalSchedule/PersonalPageLayout', () => ({
  PersonalPageLayout: ({ children, person }: { children: React.ReactNode; person: Person }) => (
    <>
      <p>{person.name}</p>
      {children}
    </>
  ),
}));
jest.mock('@/providers/WCIFProvider', () => {
  const React = jest.requireActual('react');
  const WCIFContext = React.createContext({});
  return { WCIFContext, useWCIF: () => React.useContext(WCIFContext) };
});
const wcif = {
  persons: [{ registrantId: 1, name: 'Valid person', wcaId: '2026TEST01' }],
} as Competition;
const setTitle = jest.fn();
function PersonPage() {
  const { registrantId = '' } = useParams();
  return <CompetitionPersonContainer registrantId={registrantId} />;
}
function Navigation() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate('/competitions/Test/persons/1')}>Valid person</button>
      <button onClick={() => navigate('/competitions/Test/persons/999')}>Missing person</button>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}
function renderPerson(path = '/competitions/Test/persons/999') {
  return render(
    <WCIFContext.Provider value={{ competitionId: 'Test', wcif, setTitle }}>
      <MemoryRouter initialEntries={[path]}>
        <Navigation />
        <Routes>
          <Route path="/competitions/Test" element={<div>Competition people</div>} />
          <Route path="/competitions/Test/persons/:registrantId/*" element={<PersonPage />} />
        </Routes>
      </MemoryRouter>
    </WCIFContext.Provider>,
  );
}
it.each(['', '/results', '/records'])(
  'explains a missing person and offers recovery on %s',
  (suffix) => {
    renderPerson(`/competitions/Test/persons/999${suffix}`);
    expect(screen.getByRole('status')).toHaveTextContent('competition.person.notFound');
    fireEvent.click(screen.getByRole('link', { name: 'competition.person.backToCompetitors' }));
    expect(screen.getByText('Competition people')).toBeInTheDocument();
  },
);
it('updates the title and content when moving between valid and missing people and Back', () => {
  renderPerson('/competitions/Test/persons/1');
  expect(screen.getByText('Person schedule')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Missing person' }));
  expect(screen.queryByText('Person schedule')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(setTitle).toHaveBeenLastCalledWith('competition.person.notFound');
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByText('Person schedule')).toBeInTheDocument();
  expect(setTitle).toHaveBeenLastCalledWith('Valid person');
});
