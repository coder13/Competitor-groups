import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { allChildActivities } from '../../lib/activities';
import { useWCIF } from './WCIFProvider';
import ActivityRow from '../../components/ActivitiyRow';

export default function Round() {
  const { wcif, setTitle } = useWCIF();
  const { roomId } = useParams();

  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const venue = wcif?.schedule?.venues?.find((venue) =>
    venue.rooms.some((room) => room.id.toString() === roomId)
  );
  const room = venue?.rooms?.find((room) => room.id.toString() === roomId);

  const timeZone = venue?.timezone ?? wcif.schedule.venues?.[0]?.timezone ?? '';

  const activities = useMemo(
    () =>
      room?.activities
        .flatMap((activity) =>
          activity?.childActivities?.length ? allChildActivities(activity) : activity
        )
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [],
    [room?.activities]
  );

  return (
    <div className="flex w-full flex-col text-sm md:text-base py-2">
      <div className="p-2">
        <h3 className="font-bold text-lg -mb-2">{room?.name}</h3>
        <span className="text-xs">{venue?.name}</span>
      </div>
      {activities.map((activity) => {
        return (
          <ActivityRow
            key={activity.id}
            activity={activity}
            timeZone={timeZone}
            room={room}
            showRoom={false}
          />
        );
      })}
    </div>
  );
}
