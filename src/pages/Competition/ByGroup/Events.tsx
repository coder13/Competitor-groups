import { parseActivityCode } from '@wca/helpers';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/Container';
import { groupActivitiesByRound } from '@/lib/activities';
import { getAllEvents, getEventName } from '@/lib/events';
import { useWCIF } from '@/providers/WCIFProvider';

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const Events = () => {
  const { t } = useTranslation();

  const { wcif, setTitle, competitionId } = useWCIF();
  const navigate = useNavigate();

  const uniqueGroupCountForRound = useCallback(
    (roundId: string) =>
      wcif
        ? groupActivitiesByRound(wcif, roundId)
            .map(({ activityCode }) => activityCode)
            .filter(onlyUnique).length
        : 0,
    [wcif],
  );

  const events = useMemo(() => (wcif ? getAllEvents(wcif) : []), [wcif]);

  useEffect(() => {
    setTitle('Events');
  }, [setTitle]);

  return (
    <Container className="pt-4">
      <div className="flex flex-col w-full">
        <div className="table-container">
          <table className="text-left table-base table-striped type-body">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">{t('common.wca.event')}</th>
                <th className="table-header-cell-center">{t('common.wca.round')}</th>
                <th className="table-header-cell-center">{t('common.wca.group_other')}</th>
                <th className="table-header-cell">
                  <span className="sr-only">{t('common.view')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) =>
                event.rounds?.map((round, index) => {
                  const url = `/competitions/${competitionId}/events/${round.id}`;

                  return (
                    <tr
                      key={round.id}
                      className="table-row-border-b table-row-hover-bg"
                      onClick={() => navigate(url)}>
                      <td className="table-cell">{index === 0 ? getEventName(event.id) : ''}</td>
                      <td className="table-cell-center">
                        {parseActivityCode(round.id).roundNumber}
                      </td>
                      <td className="table-cell-center">{uniqueGroupCountForRound(round.id)}</td>
                      <td className="table-cell text-right">{t('common.view')}</td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

export default Events;
