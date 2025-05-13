import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { activityCodeToName } from '@/lib/activityCodes';

export default function Test() {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = 'Test - Competition Groups';
  }, []);

  return (
    <Container className="overflow-auto">
      <div>{navigator.languages.join(', ')}</div>
      <div>{activityCodeToName('333-r1-g2-a3')}</div>
    </Container>
  );
}
