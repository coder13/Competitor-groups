import { act, renderHook, waitFor } from '@testing-library/react';
import {
  disableAssignmentNotifications,
  enableAssignmentNotifications,
  getAssignmentNotificationStatus,
  isAssignmentNotificationsEnabled,
  testAssignmentNotifications,
} from '@/lib/notifications/assignmentNotifications';
import { useAssignmentNotifications } from './useAssignmentNotifications';

jest.mock('@/lib/notifications/assignmentNotifications', () => ({
  disableAssignmentNotifications: jest.fn(),
  enableAssignmentNotifications: jest.fn(),
  getAssignmentNotificationStatus: jest.fn(),
  isAssignmentNotificationsEnabled: jest.fn(),
  testAssignmentNotifications: jest.fn(),
}));

const competitions = [
  {
    id: 'ExampleComp2026',
  },
] as ApiCompetition[];
const user = {
  id: 8184,
} as User;

describe('useAssignmentNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getAssignmentNotificationStatus).mockReturnValue('granted');
    jest.mocked(isAssignmentNotificationsEnabled).mockReturnValue(true);
    jest.mocked(enableAssignmentNotifications).mockResolvedValue('granted');
    jest.mocked(disableAssignmentNotifications).mockResolvedValue(undefined);
    jest.mocked(testAssignmentNotifications).mockResolvedValue(undefined);
  });

  it('exposes a test action when assignment notifications are enabled', async () => {
    const { result } = renderHook(() => useAssignmentNotifications({ competitions, user }));

    expect(result.current.canTest).toBe(true);

    await act(async () => {
      await result.current.test();
    });

    await waitFor(() => {
      expect(result.current.successMessage).toBe('Test notification sent.');
    });
    expect(testAssignmentNotifications).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it('surfaces test notification errors', async () => {
    jest
      .mocked(testAssignmentNotifications)
      .mockRejectedValue(new Error('Unable to send test notification'));

    const { result } = renderHook(() => useAssignmentNotifications({ competitions, user }));

    await act(async () => {
      await result.current.test();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Unable to send test notification');
    });
    expect(result.current.successMessage).toBeNull();
  });
});
