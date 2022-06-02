import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { activityCodeToName } from '../../lib/activities';
import { useWCIF } from './WCIFProvider';

export default function Round() {
  const { wcif } = useWCIF();
  const { eventId, roundNumber } = useParams();
  const activityCode = `${eventId}-r${roundNumber}`;

  const event = useMemo(() => wcif?.events?.find((e) => e.id === eventId), [wcif, eventId]);
  const round = useMemo(
    () => event?.rounds?.find((r) => r.id === activityCode),
    [event?.rounds, activityCode]
  );

  return (
    <div className="p-2">
      <h3 className="text-2xl">Groups for {activityCodeToName(round.id)}</h3>
      <table></table>
    </div>
  );
}
