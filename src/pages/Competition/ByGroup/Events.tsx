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
    <Container>
      <div className="flex flex-col w-full">
        <br />
        <div className="shadow-md border-slate-300 rounded-md">
          <table className="w-full text-left">
            <thead className="bg-slate-200">
              <tr>
                <th className="px-6 py-3">{t('common.wca.event')}</th>
                <th className="px-6 py-3 text-center">{t('common.wca.round')}</th>
                <th className="px-6 py-3 text-center">{t('common.wca.group_other')}</th>
                <th className="px-6 py-3">
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
                      className="hover:bg-blue-100 border even:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(url)}>
                      <td className="px-5 py-3">{index === 0 ? getEventName(event.id) : ''}</td>
                      <td className="px-5 py-3 text-center">
                        {parseActivityCode(round.id).roundNumber}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {uniqueGroupCountForRound(round.id)}
                      </td>
                      <td className="px-5 py-3 text-right">{t('common.view')}</td>
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
