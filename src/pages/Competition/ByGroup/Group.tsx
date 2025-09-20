import { ActivityCode } from '@wca/helpers';
import { useParams } from 'react-router-dom';
import { DesktopGroupView, GroupButtonMenu, GroupHeader, MobileGroupView } from '@/components';
import { getAllRoundActivities, getRoomData, getRooms } from '@/lib/activities';
import { matchesActivityCode, toRoundAttemptId } from '@/lib/activityCodes';
import { getAllEvents } from '@/lib/events';
import { useWCIF } from '@/providers/WCIFProvider';

export const useCommon = () => {
  const { wcif } = useWCIF();
  const { roundId, groupNumber } = useParams();
  const activityCode = `${roundId}-g${groupNumber}` as ActivityCode;

  const events = wcif ? getAllEvents(wcif) : [];

  const rounds = events.flatMap((e) => e.rounds);
  const round = rounds.find((r) => r.id === roundId);

  const AllRoundActivities = wcif
    ? getAllRoundActivities(wcif).filter((a) => {
        return !!rounds.some((r) => r.id === toRoundAttemptId(a.activityCode));
      })
    : [];
  const rooms = wcif
    ? getRooms(wcif).filter((room) =>
        room.activities.some((a) => AllRoundActivities.some((b) => a.id === b.id)),
      )
    : [];
  const multistage = rooms.length > 1;

  // All activities that relate to the activityCode
  const childActivities = AllRoundActivities?.flatMap(
    (activity) => activity.childActivities,
  ).filter((ca) => matchesActivityCode(activityCode)(ca.activityCode));

  const childActivityIds = childActivities.map((ca) => ca.id);

  const personsInActivity = wcif?.persons
    ?.filter((person) => {
      return person.assignments?.some((assignment) =>
        childActivityIds.includes(assignment.activityId),
      );
    })
    .map((person) => {
      const assignment = person.assignments?.find((a) => childActivityIds.includes(a.activityId));
      const activity = childActivities.find((ca) => ca.id === assignment?.activityId);
      const room = rooms.find((room) =>
        room.activities.some((a) => a.childActivities.some((ca) => ca.id === activity?.id)),
      );
      const stage = room && activity && getRoomData(room, activity);

      return {
        wcif,
        ...person,
        assignment,
        activity,
        room,
        stage,
      };
    });

  return {
    wcif,
    round,
    roundId,
    groupNumber,
    activityCode,
    rooms,
    multistage,
    childActivities,
    personsInActivity,
  };
};

export default function Group() {
  const { wcif, personsInActivity, multistage, round, activityCode, rooms } = useCommon();

  const groupHeader = (
    <GroupHeader round={round} activityCode={activityCode} rooms={rooms}>
      <GroupButtonMenu wcif={wcif} activityCode={activityCode} />
    </GroupHeader>
  );

  return (
    <>
      <MobileGroupView
        wcif={wcif}
        personsInActivity={personsInActivity || []}
        multistage={multistage}>
        {groupHeader}
      </MobileGroupView>
      <DesktopGroupView rooms={rooms} personsInActivity={personsInActivity || []}>
        {groupHeader}
      </DesktopGroupView>
    </>
  );
}
