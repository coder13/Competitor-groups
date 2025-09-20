import { AssignmentCode, Person } from '@wca/helpers';
import { Fragment, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '@/components/Container';
import { Grid } from '@/components/Grid/Grid';
import { Modal } from '@/components/Modal';
import { PersonSelector } from '@/components/PersonSelector';
import { usePinnedPersons } from '@/hooks/UsePinnedPersons';
import {
  doesActivityOverlapInterval,
  getScheduledDays,
  getUniqueActivityTimes,
} from '@/lib/activities';
import Assignments from '@/lib/assignments';
import { formatTime } from '@/lib/time';
import { useAuth } from '@/providers/AuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';

export default function CompareSchedules() {
  const { t } = useTranslation();
  const headerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { wcif, competitionId } = useWCIF();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const me = wcif?.persons.find((i) => i.wcaUserId === user?.id);
  const { pinnedPersons: pinnedRegistrantIds } = usePinnedPersons(competitionId);

  const pinnedPersons = pinnedRegistrantIds.map((id) =>
    wcif?.persons.find((p) => p.registrantId === id),
  );
  const persons = [me, ...pinnedPersons].filter(Boolean) as Person[];

  const scheduleDays = useMemo(() => wcif && getScheduledDays(wcif), [wcif]);

  const columnWidths = `repeat(${persons.length + 1}, minmax(5em, 1fr))`;

  const headerHeight = useMemo(
    () => (headerRef.current ? headerRef.current.clientHeight : 0),
    [headerRef],
  );

  if (!wcif) {
    return <Container>Loading...</Container>;
  }

  if (persons.length === 0) {
    return (
      <Container className="space-y-4 pt-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('competition.compareSchedules.title')}</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-blue-800 mb-2">{t('competition.compareSchedules.helpText')}</p>
            <p className="text-blue-700">{t('competition.compareSchedules.instructions')}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <span className="fa fa-users mr-2" />
            {t('competition.compareSchedules.selectPeople')}
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t('competition.compareSchedules.selectPeople')}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              {t('competition.compareSchedules.selectPeopleInstructions')}
            </p>
            <PersonSelector showCurrentUser />
          </div>
        </Modal>
      </Container>
    );
  }

  return (
    <Container className="pt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{t('competition.compareSchedules.title')}</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
          <span className="fa fa-users mr-1" />
          Manage People
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('competition.compareSchedules.selectPeople')}>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            {t('competition.compareSchedules.selectPeopleInstructions')}
          </p>
          <PersonSelector showCurrentUser />
        </div>
      </Modal>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <p className="text-blue-800 text-sm">{t('competition.compareSchedules.helpText')}</p>
      </div>
      <Grid
        columnWidths={columnWidths}
        className="[&>div]:py-2 [&>div]:px-3 [&>div]:text-center sticky top-0"
        ref={headerRef}>
        <div className="font-bold bg-gray-100 text-center z-50">Time</div>
        {persons.map((p) => (
          <div key={p.wcaUserId} className="bg-gray-100 sticky top-0 z-50">
            <Link
              to={`/competitions/${competitionId}/persons/${p.registrantId}`}
              className="font-bold">
              {p.name}
            </Link>
          </div>
        ))}
      </Grid>
      <Grid columnWidths={columnWidths} className="[&>div]:py-2 [&>div]:px-3 [&>div]:text-center">
        {scheduleDays?.map((day) => {
          const startTimes = getUniqueActivityTimes(day.activities);

          return (
            <Fragment key={day.date}>
              <div
                className="col-span-full font-bold bg-gray-100 sticky"
                style={{
                  top: headerHeight,
                }}>
                {day.date}
              </div>
              {startTimes.map((startTime, index) => {
                const endTime = startTimes[index + 1];

                if (!endTime) {
                  return null;
                }

                const activitiesHappeningDuringStartTime = day.activities.filter((activity) =>
                  doesActivityOverlapInterval(activity, startTime.startTime, endTime.startTime),
                );

                return (
                  <Fragment key={startTime.startTime}>
                    <div>{formatTime(startTime.startTime)}</div>
                    {persons.map((p) => {
                      const assignment = p.assignments?.find((a) =>
                        activitiesHappeningDuringStartTime.some(
                          (activity) => activity.id === a.activityId,
                        ),
                      );
                      const assignmentCode = assignment?.assignmentCode as AssignmentCode;

                      if (!assignmentCode) {
                        return <div key={`${p.wcaUserId}-${startTime.startTime}`}>-</div>;
                      }

                      const config = Assignments.find((i) => i.id === assignmentCode);

                      return (
                        <div
                          key={`${p.wcaUserId}-${startTime.startTime}`}
                          style={{
                            backgroundColor: config && `${config.color}7f`,
                          }}>
                          {config ? config.key.toUpperCase() : assignmentCode[0].toUpperCase()}
                        </div>
                      );
                    })}
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
      </Grid>
    </Container>
  );
}
