import { useWCIF } from './WCIFProvider';
import { Competitors } from '../../containers/Competitors';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/Container';

export default function CompetitionHome() {
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('');
  }, [setTitle]);

  return (
    <Container>
      <Link
        className="border bg-green-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-green-400 group transition-colors my-1 flex-row mx-2"
        to={`information`}>
        View Competition Information
      </Link>
      <br />
      <hr />
      {wcif && <Competitors wcif={wcif} />}
    </Container>
  );
}
