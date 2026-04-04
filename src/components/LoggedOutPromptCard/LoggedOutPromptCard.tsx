import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';

interface LoggedOutPromptCardProps {
  onLogin: () => void;
}

export function LoggedOutPromptCard({ onLogin }: LoggedOutPromptCardProps) {
  const { t } = useTranslation();

  return (
    <section className="px-2" aria-label={t('home.loggedOutCard.title')}>
      <div className="px-4 py-4 space-y-2 border rounded-md shadow-sm border-primary bg-primary/30">
        <div className="space-y-1">
          <h2 className="type-subheading">{t('home.loggedOutCard.title')}</h2>
          <p className="type-body-sm text-subtle">{t('home.loggedOutCard.description')}</p>
        </div>
        <div>
          <Button className="justify-center w-full sm:w-auto" onClick={onLogin}>
            <i className="fa fa-user" aria-hidden="true" />
            <span>{t('common.login')}</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
