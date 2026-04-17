import { EventId } from '@wca/helpers';
import { useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CompetitionPsychSheetEventContainer } from '@/containers/CompetitionPsychSheetEvent';

export const PsychSheetEvent = () => {
  const { competitionId, eventId } = useParams<{
    competitionId: string;
    eventId: EventId;
  }>();
  const navigate = useNavigate();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams({
    resultType: 'average',
  });
  const psychSheetBaseUrl = `/competitions/${competitionId}/psych-sheet`;
  const resultType = useMemo(
    () => urlSearchParams.get('resultType') as 'average' | 'single',
    [urlSearchParams],
  );

  const handleEventChange = useCallback(
    (newEventId: EventId) => {
      navigate(
        `${psychSheetBaseUrl}/${newEventId}${
          urlSearchParams.toString() ? `?${urlSearchParams}` : ''
        }`,
      );
    },
    [navigate, psychSheetBaseUrl, urlSearchParams],
  );

  const handleResultTypeChange = useCallback(
    (newResultType: 'average' | 'single') => {
      setUrlSearchParams({
        resultType: newResultType,
      });
    },
    [setUrlSearchParams],
  );

  if (!competitionId || !eventId) {
    return null;
  }

  return (
    <CompetitionPsychSheetEventContainer
      competitionId={competitionId}
      eventId={eventId}
      resultType={resultType}
      onEventChange={handleEventChange}
      onResultTypeChange={handleResultTypeChange}
      LinkComponent={Link}
    />
  );
};
