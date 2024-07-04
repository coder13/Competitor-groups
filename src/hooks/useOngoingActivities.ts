import { ActivitiesSubscriptionDocument, NotifyComp, useActivitiesQuery } from '../queries';
import { useWCIF } from '../providers/WCIFProvider';
import { getAllActivities } from '../lib/activities';
import { useEffect } from 'react';

export const useOngoingActivities = (competitionId: string) => {
  const { wcif } = useWCIF();
  const activities = wcif ? getAllActivities(wcif) : [];

  const { data, subscribeToMore } = useActivitiesQuery(competitionId!);
  // const { data: data2 } = useActivitiesSubscription(competitionId!);
  const liveActivities = data?.activities.filter((a) => !a.endTime && a.startTime); // TODO: use subscription
  // these are the activities that are currently ongoing
  const ongoingActivities = activities.filter((a) =>
    liveActivities?.some((b) => b.activityId === a.id)
  );

  useEffect(() => {
    const unsub = subscribeToMore<{
      activity: NotifyComp.Activity;
    }>({
      document: ActivitiesSubscriptionDocument,
      variables: { competitionIds: [wcif?.id] },
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
  }, [subscribeToMore, wcif]);

  return {
    data,
    liveActivities,
    ongoingActivities,
  };
};
