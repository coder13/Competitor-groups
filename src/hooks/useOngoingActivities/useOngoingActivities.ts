import { useEffect } from 'react';
import { getAllActivities } from '@/lib/activities';
import { useWCIF } from '@/providers/WCIFProvider';
import { ActivitiesSubscriptionDocument, NotifyCompActivity, useActivitiesQuery } from '@/queries';

export const useOngoingActivities = (competitionId: string) => {
  const { wcif } = useWCIF();
  const loadedCompetitionId = wcif?.id === competitionId ? competitionId : undefined;
  const activities = wcif && loadedCompetitionId ? getAllActivities(wcif) : [];

  const { data, subscribeToMore } = useActivitiesQuery(loadedCompetitionId || '');
  const liveActivities = data?.activities.filter((a) => !a.endTime && a.startTime);
  // these are the activities that are currently ongoing
  const ongoingActivities = activities.filter((a) =>
    liveActivities?.some((b) => b.activityId === a.id),
  );

  useEffect(() => {
    if (!loadedCompetitionId) {
      return;
    }

    const unsub = subscribeToMore<{
      activity: NotifyCompActivity;
    }>({
      document: ActivitiesSubscriptionDocument,
      variables: { competitionIds: [loadedCompetitionId] },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData?.data?.activity) {
          return prev;
        }

        const newActivity = subscriptionData.data.activity;

        return {
          ...prev,
          activities: [
            ...prev.activities.filter((a) => a.activityId !== newActivity.activityId),
            newActivity,
          ],
        };
      },
    });

    return () => unsub();
  }, [loadedCompetitionId, subscribeToMore]);

  return {
    data,
    liveActivities,
    ongoingActivities,
  };
};
