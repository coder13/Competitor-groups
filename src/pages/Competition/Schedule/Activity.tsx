import { Activity } from '@wca/helpers';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CompetitionActivityContainer } from '@/containers/CompetitionActivity';
import { activityCodeToName } from '@/lib/activityCodes';

export function CompetitionActivity() {
  const { competitionId, activityId } = useParams();
  const navigate = useNavigate();

  if (!competitionId || !activityId) {
    return null;
  }

  return (
    <CompetitionActivityContainer
      competitionId={competitionId}
      activityId={parseInt(activityId, 10)}
      LinkComponent={Link}
      onNavigate={navigate}
    />
  );
}

export const niceActivityName = (activty: Activity) => {
  if (activty.activityCode.startsWith('other')) {
    return activty.name;
  } else {
    try {
      return activityCodeToName(activty.activityCode);
    } catch (e) {
      console.error(e);
      return activty.name;
    }
  }
};
