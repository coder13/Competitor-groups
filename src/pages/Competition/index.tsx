import { useParams, Outlet } from 'react-router-dom';
import WCIFProvider from './WCIFProvider';

export default function Competition() {
  const { competitionId } = useParams();

  return (
    <WCIFProvider competitionId={competitionId}>
      <Outlet />
    </WCIFProvider>
  );
}
