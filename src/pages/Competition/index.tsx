import { useParams, Outlet } from 'react-router-dom';
import WCIFProvider from '../../providers/WCIFProvider';

export default function Competition() {
  const { competitionId } = useParams();

  return (
    <WCIFProvider competitionId={competitionId}>
      <Outlet />
    </WCIFProvider>
  );
}
