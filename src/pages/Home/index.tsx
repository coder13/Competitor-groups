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
    document.title = t('common.title');
  }, [t]);

  return (
    <div className="flex flex-col items-center w-full overflow-auto">
      <Container>
        <div className="flex flex-col w-full text-xs md:text-sm py-2 px-2 md:px-0">
          <p>{t('home.subtitle')}</p>
          <p>{t('home.explanation')}</p>
          <Link to="/about" className="text-blue-700 underline">
            {t('home.learnMore')}
          </Link>
        </div>
        <div className="px-2">
          <Link
            className="flex w-full py-2.5 px-2 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 "
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
