import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Container, DisclaimerText, LinkButton } from '@/components';
import { ScheduleContainer } from '@/containers/Schedule';
import { useWCIF } from '@/providers/WCIFProvider';

export function Schedule() {
  const { t } = useTranslation();
  const competitionId = useParams().competitionId;
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle(t('competition.schedule.title'));
  }, [setTitle, t]);

  const compId = wcif?.id || competitionId;

  return (
    <Container>
      <div className="flex w-full flex-col text-sm md:text-base py-2 p-1 sm:p-0 space-y-1">
        <DisclaimerText className="my-2" />
        <hr className="" />
        <div className="flex flex-row justify-between">
          <LinkButton
            to={`/competitions/${compId}/rooms`}
            title={t('competition.schedule.selectRoom')}
            color="blue"
          />
        </div>
        <hr className="" />
        {wcif && <ScheduleContainer wcif={wcif} />}
      </div>
    </Container>
  );
}
