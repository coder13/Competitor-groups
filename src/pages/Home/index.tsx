import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CompetitionSelect } from '@/components/CompetitionSelect';
import { Container } from '@/components/Container';
import { LoggedOutPromptCard } from '@/components/LoggedOutPromptCard';
import { MyCompetitions } from '@/containers/MyCompetitions';
import UpcomingCompetitions from '@/containers/UpcomingCompetitions/UpcomingCompetitions';
import { useAuth } from '@/providers/AuthProvider';

export default function Home() {
  const { t } = useTranslation();
  const { user, signIn } = useAuth();

  useEffect(() => {
    document.title = t('common.appName');
  }, [t]);

  return (
    <div className="flex flex-col items-center w-full overflow-auto">
      <Container className="mt-2 space-y-2">
        <div className="flex flex-col w-full px-6 md:px-6 type-body">
          <p className="type-body-sm">{t('home.subtitle')}</p>
          <p className="type-body-sm">{t('home.explanation')}</p>
          <Link to="/about" className="link-inline">
            {t('home.learnMore')}
          </Link>
          <Link to="/support" className="link-inline">
            {t('home.support')}
          </Link>
        </div>
        {!user && <LoggedOutPromptCard onLogin={signIn} />}
        <MyCompetitions />
        <div className="px-2">
          <CompetitionSelect onSelect={(e) => console.log(e)} />
        </div>
        <UpcomingCompetitions />
      </Container>
    </div>
  );
}
