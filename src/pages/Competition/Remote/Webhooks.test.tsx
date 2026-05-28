import { useQuery } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { isCompetitionDelegateOrOrganizer } from '@/lib/competitionAuthorization';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import CompetitionRemoteWebhooks from './Webhooks';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));
jest.mock('@/lib/competitionAuthorization', () => ({
  isCompetitionDelegateOrOrganizer: jest.fn(),
}));
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/providers/NotifyCompRemoteAuthProvider', () => ({
  useNotifyCompRemoteAuth: jest.fn(),
}));
jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: jest.fn(),
}));
jest.mock('./RemoteWebhookSetup', () => ({
  RemoteWebhookSetup: ({ competitionId }: { competitionId: string }) => (
    <div>Webhook editor for {competitionId}</div>
  ),
}));

const wcif = {
  persons: [],
  schedule: {
    numberOfDays: 1,
    startDate: '2026-06-01',
    venues: [],
  },
};

const renderWebhooksPage = () => {
  render(
    <MemoryRouter initialEntries={['/competitions/ExampleComp2026/admin/webhooks']}>
      <Routes>
        <Route
          path="/competitions/:competitionId/admin/webhooks"
          element={<CompetitionRemoteWebhooks />}
        />
      </Routes>
    </MemoryRouter>,
  );
};

describe('CompetitionRemoteWebhooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useWCIF).mockReturnValue({
      competitionId: 'ExampleComp2026',
      setTitle: jest.fn(),
      wcif,
    } as unknown as ReturnType<typeof useWCIF>);
    jest.mocked(useAuth).mockReturnValue({
      user: { id: 1 },
    } as unknown as ReturnType<typeof useAuth>);
    jest.mocked(isCompetitionDelegateOrOrganizer).mockReturnValue(true);
    jest.mocked(useNotifyCompRemoteAuth).mockReturnValue({
      authenticating: false,
      error: null,
      isAuthenticatedForCompetition: () => true,
      signIn: jest.fn(),
    } as unknown as ReturnType<typeof useNotifyCompRemoteAuth>);
    jest.mocked(useQuery).mockReturnValue({
      data: {
        competition: {
          id: 'ExampleComp2026',
        },
      },
      error: null,
      loading: false,
    } as unknown as ReturnType<typeof useQuery>);
  });

  it('asks users to authenticate before managing webhooks', () => {
    jest.mocked(useNotifyCompRemoteAuth).mockReturnValue({
      authenticating: false,
      error: null,
      isAuthenticatedForCompetition: () => false,
      signIn: jest.fn(),
    } as unknown as ReturnType<typeof useNotifyCompRemoteAuth>);

    renderWebhooksPage();

    expect(
      screen.getByRole('button', { name: 'Sign in to Live Activities Remote' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Webhook editor for ExampleComp2026')).not.toBeInTheDocument();
  });

  it('asks users to import the competition before managing webhooks', () => {
    jest.mocked(useQuery).mockReturnValue({
      data: {
        competition: null,
      },
      error: null,
      loading: false,
    } as unknown as ReturnType<typeof useQuery>);

    renderWebhooksPage();

    expect(screen.getByText(/Not imported/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Remote' })).toHaveAttribute(
      'href',
      '/competitions/ExampleComp2026/admin/remote',
    );
    expect(screen.queryByText('Webhook editor for ExampleComp2026')).not.toBeInTheDocument();
  });

  it('renders the webhook editor for imported competitions', () => {
    renderWebhooksPage();

    expect(screen.getByRole('heading', { name: 'Webhooks' })).toBeInTheDocument();
    expect(screen.getByText('Webhook editor for ExampleComp2026')).toBeInTheDocument();
  });
});
