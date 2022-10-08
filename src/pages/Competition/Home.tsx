import { useWCIF } from './WCIFProvider';
import Competitors from './Competitors';

export default function CompetitionHome() {
  const { wcif } = useWCIF();

  return <Competitors wcif={wcif} />;
}
