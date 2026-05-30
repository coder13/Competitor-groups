import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';
import { useNotifyCompWebSocketStatus } from '@/hooks/useNotifyCompWebSocketStatus';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import CompetitionRemote from './index';

jest.mock('@/hooks/useCompetitionRemoteControl', () => ({
  useCompetitionRemoteControl: jest.fn(),
}));
jest.mock('@/hooks/useNotifyCompWebSocketStatus', () => ({
  useNotifyCompWebSocketStatus: jest.fn(),
}));
jest.mock('./RemoteActivityList', () => ({
  RemoteGroupList: () => <div />,
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

const wcif = {
  persons: [],
  schedule: {
    numberOfDays: 1,
    startDate: '2026-06-01',
    venues: [],
  },
};

const remoteDefaults = {
  activities: [],
  activityGroups: [],
  autoAdvance: false,
  canManageRemote: true,
  error: null,
  importCompetition: jest.fn(),
  isAuthenticated: true,
  isLoading: false,
  isSaving: false,
  nextGroup: null,
  scheduledActivities: [],
};

const renderRemote = () => {
  render(
    <MemoryRouter initialEntries={['/competitions/ExampleComp2026/remote']}>
      <Routes>
        <Route path="/competitions/:competitionId/remote" element={<CompetitionRemote />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('CompetitionRemote webhook management link', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useWCIF).mockReturnValue({
      setTitle: jest.fn(),
      wcif,
    } as unknown as ReturnType<typeof useWCIF>);
    jest.mocked(useAuth).mockReturnValue({
      user: { id: 1 },
    } as unknown as ReturnType<typeof useAuth>);
    jest.mocked(useNotifyCompWebSocketStatus).mockReturnValue({
      status: 'connected',
    } as ReturnType<typeof useNotifyCompWebSocketStatus>);
    jest.mocked(useNotifyCompRemoteAuth).mockReturnValue({
      authenticating: false,
      error: null,
      signIn: jest.fn(),
    } as unknown as ReturnType<typeof useNotifyCompRemoteAuth>);
  });

  it('does not show webhook management before Remote authentication', () => {
    jest.mocked(useCompetitionRemoteControl).mockReturnValue({
      ...remoteDefaults,
      isAuthenticated: false,
    } as unknown as ReturnType<typeof useCompetitionRemoteControl>);

    renderRemote();

    expect(
      screen.getByRole('button', { name: 'Sign in to Live Activities Remote' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Manage webhooks' })).not.toBeInTheDocument();
  });

  it('does not show webhook management before the competition is imported', () => {
    jest.mocked(useCompetitionRemoteControl).mockReturnValue({
      ...remoteDefaults,
      competition: null,
    } as unknown as ReturnType<typeof useCompetitionRemoteControl>);

    renderRemote();

    expect(screen.getByText('Import schedule')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Manage webhooks' })).not.toBeInTheDocument();
  });

  it('links to webhook management after the competition is imported', () => {
    jest.mocked(useCompetitionRemoteControl).mockReturnValue({
      ...remoteDefaults,
      competition: {
        id: 'ExampleComp2026',
      },
    } as unknown as ReturnType<typeof useCompetitionRemoteControl>);

    renderRemote();

    expect(screen.getByRole('link', { name: 'Manage webhooks' })).toHaveAttribute(
      'href',
      '/competitions/ExampleComp2026/admin/webhooks',
    );
    expect(screen.queryByRole('heading', { name: 'Webhook setup' })).not.toBeInTheDocument();
  });
});
