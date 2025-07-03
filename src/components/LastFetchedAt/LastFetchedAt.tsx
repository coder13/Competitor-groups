import { intlFormatDistance } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface LastFetchAtProps {
  lastFetchedAt: Date;
}

export const LastFetchedAt = ({ lastFetchedAt }: LastFetchAtProps) => {
  const { t } = useTranslation();

  return (
    <div className="w-full text-xs text-gray-500 text-right">
      2{' '}
      {t('common.lastFetched', {
        date: intlFormatDistance(lastFetchedAt, new Date(), {
          locale: navigator.language,
        }),
      })}
    </div>
  );
};
