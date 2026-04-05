import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';

interface AppUpdatePromptProps {
  onUpdate: () => void;
}

export function AppUpdatePrompt({ onUpdate }: AppUpdatePromptProps) {
  const { t } = useTranslation();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <section className="pointer-events-auto w-full max-w-sm rounded-md border border-primary bg-panel p-4 shadow-lg">
        <div className="space-y-2">
          <h2 className="type-subheading">{t('appUpdate.title')}</h2>
          <p className="type-body-sm text-subtle">{t('appUpdate.description')}</p>
        </div>
        <div className="mt-4 flex">
          <Button className="w-full justify-center" onClick={onUpdate}>
            {t('appUpdate.action')}
          </Button>
        </div>
      </section>
    </div>
  );
}
