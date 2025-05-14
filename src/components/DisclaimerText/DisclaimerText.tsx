import { useTranslation } from 'react-i18next';
import { NoteBox } from '../Notebox';

export function DisclaimerText({ className }: { className?: string }) {
  const { t } = useTranslation();
  return <NoteBox className={className} text={t('disclaimerText')} />;
}
