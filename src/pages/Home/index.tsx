import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CompetitionSelect } from '@/components/CompetitionSelect';
import { Container } from '@/components/Container';
import { MyCompetitions } from '@/containers/MyCompetitions';
import UpcomingCompetitions from '@/containers/UpcomingCompetitions/UpcomingCompetitions';

export default function Home() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('common.appName');
  }, [t]);

  return (
    <div className="flex flex-col items-center w-full overflow-auto">
      <Container>
        <div className="flex flex-col w-full px-2 py-2 md:px-0 type-body">
          <p className="type-body-sm">{t('home.subtitle')}</p>
          <p className="type-body-sm">{t('home.explanation')}</p>
          <Link to="/about" className="link-inline">
            {t('home.learnMore')}
          </Link>
        </div>
        <div className="px-2">
          <Link
            className="flex w-full py-2.5 px-2 me-2 mb-2 type-label focus:outline-none bg-panel rounded-lg border border-tertiary hover-bg-tertiary hover-text-primary"
            to="/support">
            {t('home.support')}
          </Link>
        </div>
        <MyCompetitions />
        <div className="px-2">
          <CompetitionSelect onSelect={(e) => console.log(e)} />
        </div>
        <UpcomingCompetitions />
      </Container>
    </div>
  );
}
