import { useParams, Outlet } from 'react-router-dom';
import { WCIFProvider } from '../../providers/WCIFProvider';

export default function CompetitionLayout() {
  const { competitionId } = useParams();

  return (
    <WCIFProvider competitionId={competitionId}>
      <Outlet />
    </WCIFProvider>
  );
}
