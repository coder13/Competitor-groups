import { renderHook, act } from '@testing-library/react';
import { useNotifyCompRemoteActivities } from '@/hooks/useNotifyCompRemoteActivities';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import { useCompetitionRemoteControl } from './useCompetitionRemoteControl';

jest.mock('@/hooks/useNotifyCompRemoteActivities', () => ({
  useNotifyCompRemoteActivities: jest.fn(),
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

describe('useCompetitionRemoteControl', () => {
  it('stops and resets the current group before starting the previous group', async () => {
    const resetActivities = jest.fn().mockResolvedValue(undefined);
    const startActivities = jest.fn().mockResolvedValue(undefined);
    const stopActivities = jest.fn().mockResolvedValue(undefined);

    jest.mocked(useWCIF).mockReturnValue({ wcif } as unknown as ReturnType<typeof useWCIF>);
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
});
