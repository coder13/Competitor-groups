import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Header from './Header';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/providers/AuthProvider', () => ({ useAuth: () => ({ user: null }) }));
jest.mock('@/providers/WCIFProvider', () => ({ useWCIF: () => ({}) }));
jest.mock('@/lib/featureFlags', () => ({ FEATURE_FLAGS: {} }));
jest.mock('@/hooks/queries/useCompetition', () => ({ useCompetition: () => ({}) }));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ getQueryData: () => undefined, getQueriesData: () => [] }),
}));
it.each(['/', '/settings'])(
  'names the Home and Settings links without a bogus competition link on %s',
  (path) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'common.home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'header.settings' })).toHaveAttribute(
      'href',
      '/settings',
    );
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: '' })).not.toBeInTheDocument();
  },
);
it('uses the competition ID as a nonempty name while the competition details load', () => {
  render(
    <MemoryRouter initialEntries={['/competitions/Loading2026']}>
      <Routes>
        <Route path="/competitions/:competitionId" element={<Header />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByRole('link', { name: 'Loading2026' })).toHaveAttribute(
    'href',
    '/competitions/Loading2026',
  );
});
