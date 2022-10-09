import { useWCIF } from './WCIFProvider';
import Competitors from './Competitors';
import { useEffect } from 'react';

export default function CompetitionHome() {
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('');
  }, [setTitle]);

  return <Competitors wcif={wcif} />;
}
