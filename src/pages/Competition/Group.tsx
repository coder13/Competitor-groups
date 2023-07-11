import { useParams } from 'react-router-dom';
import { activityCodeToName } from '../../lib/activities';

export default function Group() {
  const { eventId, roundNumber } = useParams();
  const activityCode = `${eventId}-r${roundNumber}-g:{groupNumber}`;

  // Get everyone associated with this activityCode
  // Split everyone up by assignmentCode and communicate where they are supposed to be for each group.

  return (
    <div className="p-2">
      <h3 className="text-2xl">Groups for {activityCodeToName(activityCode)}</h3>
    </div>
  );
}
