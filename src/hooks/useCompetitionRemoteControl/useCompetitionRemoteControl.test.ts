import { renderHook, act } from '@testing-library/react';
import { useNotifyCompRemoteActivities } from '@/hooks/useNotifyCompRemoteActivities';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import { useCompetitionRemoteControl } from './useCompetitionRemoteControl';

jest.mock('@/hooks/useNotifyCompRemoteActivities', () => ({
  useNotifyCompRemoteActivities: jest.fn(),
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

const activity = ({
  activityCode,
  id,
  name,
  startTime,
}: {
  activityCode: string;
  id: number;
  name: string;
  startTime: string;
}) => ({
  activityCode,
  childActivities: [],
  endTime: '2026-06-01T10:10:00Z',
  extensions: [],
  id,
  name,
  startTime,
});

const wcif = {
  persons: [
    {
      roles: ['delegate'],
      wcaUserId: 1,
    },
    {
      roles: ['staff-dataentry'],
      wcaUserId: 2,
    },
  ],
  schedule: {
    venues: [
      {
        rooms: [
          {
            activities: [
              activity({
                activityCode: '333-r1-g1',
                id: 101,
                name: '3x3x3 Cube, Round 1, Group 1',
                startTime: '2026-06-01T10:00:00Z',
              }),
              activity({
                activityCode: '222-r1-g1',
                id: 102,
                name: '2x2x2 Cube, Round 1, Group 1',
                startTime: '2026-06-01T10:20:00Z',
              }),
            ],
            id: 1,
            name: 'Stage 1',
          },
        ],
      },
    ],
  },
};

const wcifWithFourGroups = {
  ...wcif,
  schedule: {
    venues: [
      {
        rooms: [
          {
            activities: [
              activity({
                activityCode: '333-r1-g1',
                id: 101,
                name: '3x3x3 Cube, Round 1, Group 1',
                startTime: '2026-06-01T10:00:00Z',
              }),
              activity({
                activityCode: '333-r1-g2',
                id: 102,
                name: '3x3x3 Cube, Round 1, Group 2',
                startTime: '2026-06-01T10:20:00Z',
              }),
              activity({
                activityCode: '333-r1-g3',
                id: 103,
                name: '3x3x3 Cube, Round 1, Group 3',
                startTime: '2026-06-01T10:40:00Z',
              }),
              activity({
                activityCode: '333-r1-g4',
                id: 104,
                name: '3x3x3 Cube, Round 1, Group 4',
                startTime: '2026-06-01T11:00:00Z',
              }),
            ],
            id: 1,
            name: 'Stage 1',
          },
        ],
      },
    ],
  },
};

describe('useCompetitionRemoteControl', () => {
  it('stops and resets the current group before starting the previous group', async () => {
    const resetActivities = jest.fn().mockResolvedValue(undefined);
    const startActivities = jest.fn().mockResolvedValue(undefined);
    const stopActivities = jest.fn().mockResolvedValue(undefined);

    jest.mocked(useWCIF).mockReturnValue({ wcif } as unknown as ReturnType<typeof useWCIF>);
    jest.mocked(useAuth).mockReturnValue({
      user: { id: 1 },
    } as unknown as ReturnType<typeof useAuth>);
    jest.mocked(useNotifyCompRemoteAuth).mockReturnValue({
      isAuthenticatedForCompetition: () => true,
    } as unknown as ReturnType<typeof useNotifyCompRemoteAuth>);
    jest.mocked(useNotifyCompRemoteActivities).mockReturnValue({
      activities: [
        {
          activityId: 101,
          endTime: '2026-06-01T10:09:00Z',
          startTime: '2026-06-01T10:01:00Z',
        },
        {
          activityId: 102,
          endTime: null,
          startTime: '2026-06-01T10:21:00Z',
        },
      ],
      resetActivities,
      startActivities,
      stopActivities,
    } as unknown as ReturnType<typeof useNotifyCompRemoteActivities>);

    const { result } = renderHook(() =>
      useCompetitionRemoteControl({ competitionId: 'ExampleComp2026' }),
    );

    await act(async () => {
      await result.current.switchToPreviousGroup();
    });

    expect(stopActivities).toHaveBeenCalledWith([102]);
    expect(resetActivities).toHaveBeenCalledWith([102]);
    expect(startActivities).toHaveBeenCalledWith([101]);
    expect(stopActivities.mock.invocationCallOrder[0]).toBeLessThan(
      resetActivities.mock.invocationCallOrder[0],
    );
    expect(resetActivities.mock.invocationCallOrder[0]).toBeLessThan(
      startActivities.mock.invocationCallOrder[0],
    );
  });

  it('does not load or perform remote actions for users who are not listed delegates or organizers', async () => {
    const startActivities = jest.fn().mockResolvedValue(undefined);

    jest.mocked(useWCIF).mockReturnValue({ wcif } as unknown as ReturnType<typeof useWCIF>);
    jest.mocked(useAuth).mockReturnValue({
      user: { id: 2 },
    } as unknown as ReturnType<typeof useAuth>);
    jest.mocked(useNotifyCompRemoteAuth).mockReturnValue({
      isAuthenticatedForCompetition: () => true,
    } as unknown as ReturnType<typeof useNotifyCompRemoteAuth>);
    jest.mocked(useNotifyCompRemoteActivities).mockReturnValue({
      activities: [],
      importCompetition: jest.fn(),
      resetAllActivities: jest.fn(),
      startActivities,
      updateAutoAdvance: jest.fn(),
    } as unknown as ReturnType<typeof useNotifyCompRemoteActivities>);

    const { result } = renderHook(() =>
      useCompetitionRemoteControl({ competitionId: 'ExampleComp2026' }),
    );

    expect(useNotifyCompRemoteActivities).toHaveBeenCalledWith({
      competitionId: 'ExampleComp2026',
      enabled: false,
      roomId: undefined,
    });
    expect(result.current.canManageRemote).toBe(false);

    await expect(result.current.startGroup(result.current.activityGroups[0])).rejects.toThrow(
      'Only listed competition delegates and organizers can manage remote control.',
    );
    expect(startActivities).not.toHaveBeenCalled();
  });

  it('finishes every started activity that has no end time', async () => {
    const stopActivities = jest.fn().mockResolvedValue(undefined);

    jest.mocked(useWCIF).mockReturnValue({ wcif } as unknown as ReturnType<typeof useWCIF>);
    jest.mocked(useAuth).mockReturnValue({
      user: { id: 1 },
    } as unknown as ReturnType<typeof useAuth>);
    jest.mocked(useNotifyCompRemoteAuth).mockReturnValue({
      isAuthenticatedForCompetition: () => true,
    } as unknown as ReturnType<typeof useNotifyCompRemoteAuth>);
    jest.mocked(useNotifyCompRemoteActivities).mockReturnValue({
      activities: [
        {
          activityId: 101,
          endTime: null,
          startTime: '2026-06-01T10:01:00Z',
        },
        {
          activityId: 102,
          endTime: '2026-06-01T10:25:00Z',
          startTime: '2026-06-01T10:21:00Z',
        },
        {
          activityId: 103,
          endTime: null,
          startTime: null,
        },
      ],
      stopActivities,
    } as unknown as ReturnType<typeof useNotifyCompRemoteActivities>);

    const { result } = renderHook(() =>
      useCompetitionRemoteControl({ competitionId: 'ExampleComp2026' }),
    );

    await act(async () => {
      await result.current.finishAllActivities();
    });

    expect(stopActivities).toHaveBeenCalledWith([101]);
  });

  it('starts and stops skipped next groups before starting a later target group', async () => {
    const startActivities = jest.fn().mockResolvedValue(undefined);
    const stopActivities = jest.fn().mockResolvedValue(undefined);

    jest.mocked(useWCIF).mockReturnValue({
      wcif: wcifWithFourGroups,
    } as unknown as ReturnType<typeof useWCIF>);
    jest.mocked(useAuth).mockReturnValue({
      user: { id: 1 },
    } as unknown as ReturnType<typeof useAuth>);
    jest.mocked(useNotifyCompRemoteAuth).mockReturnValue({
      isAuthenticatedForCompetition: () => true,
    } as unknown as ReturnType<typeof useNotifyCompRemoteAuth>);
    jest.mocked(useNotifyCompRemoteActivities).mockReturnValue({
      activities: [
        {
          activityId: 101,
          endTime: null,
          startTime: '2026-06-01T10:01:00Z',
        },
      ],
      startActivities,
      stopActivities,
    } as unknown as ReturnType<typeof useNotifyCompRemoteActivities>);

    const { result } = renderHook(() =>
      useCompetitionRemoteControl({ competitionId: 'ExampleComp2026' }),
    );

    await act(async () => {
      await result.current.startGroup(result.current.activityGroups[3]);
    });

    expect(stopActivities).toHaveBeenNthCalledWith(1, [101]);
    expect(startActivities).toHaveBeenNthCalledWith(1, [102, 103]);
    expect(stopActivities).toHaveBeenNthCalledWith(2, [102, 103]);
    expect(startActivities).toHaveBeenNthCalledWith(2, [104]);
    expect(stopActivities.mock.invocationCallOrder[0]).toBeLessThan(
      startActivities.mock.invocationCallOrder[0],
    );
    expect(startActivities.mock.invocationCallOrder[0]).toBeLessThan(
      stopActivities.mock.invocationCallOrder[1],
    );
    expect(stopActivities.mock.invocationCallOrder[1]).toBeLessThan(
      startActivities.mock.invocationCallOrder[1],
    );
  });
});
