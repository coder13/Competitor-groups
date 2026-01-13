import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, ExternalLink } from '@/components';
import { useCompetition } from '@/hooks/queries/useCompetition';
import { useWCIF } from '@/providers/WCIFProvider';
import { UserRow } from './UserRow';

export default function Information() {
  const { setTitle, wcif } = useWCIF();
  const { competitionId = '' } = useParams<{ competitionId: string }>();

  const { data, error } = useCompetition(competitionId);

  useEffect(() => {
    setTitle('Information');
  }, [setTitle]);

  if (error) {
    return null;
  }

  return (
    <Container>
      <div className="flex flex-col w-full p-2 space-y-2 type-body">
        <ExternalLink href={data?.website || ''}>View WCA competition webpage</ExternalLink>
        <div className="flex flex-col w-full p-2 bg-white border rounded border-slate-100 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="type-title">Venue</h2>
          <a
            className="flex justify-between w-full rounded align-center hover:opacity-80 link-inline"
            href={`https://maps.google.com/maps?q=${wcif?.schedule?.venues?.[0]?.name},${data?.venue_address},${data?.city}`}
            target="_blank"
            rel="noreferrer">
            <span>
              {wcif?.schedule?.venues?.[0]?.name}
              <br />
              {data?.venue_address}
              <br />
              {data?.city}
            </span>
            <i className="m-0 fa fa-solid fa-arrow-up-right-from-square" />
          </a>
          <p className="type-body">{data?.venue_details}</p>
        </div>
        <div>
          <h2 className="type-title">Organizers</h2>
          <ul className="flex flex-col space-y-2">
            {data?.organizers?.map((user) => <UserRow key={user.id} user={user} />)}
          </ul>
        </div>
        <div>
          <h2 className="type-title">Delegates</h2>
          <ul className="flex flex-col space-y-2">
            {data?.delegates?.map((user) => <UserRow key={user.id} user={user} />)}
          </ul>
        </div>
      </div>
    </Container>
  );
}
