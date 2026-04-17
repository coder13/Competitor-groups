import { useEffect } from 'react';
import { Container, ExternalLink } from '@/components';
import { useCompetition } from '@/hooks/queries/useCompetition';
import { UserRow } from '@/pages/Competition/Information/UserRow';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionInformationContainerProps {
  competitionId: string;
}

export function CompetitionInformationContainer({
  competitionId,
}: CompetitionInformationContainerProps) {
  const { setTitle, wcif } = useWCIF();
  const { data, error } = useCompetition(competitionId);

  useEffect(() => {
    setTitle('Information');
  }, [setTitle]);

  if (error) {
    return null;
  }

  return (
    <Container>
      <div className="flex w-full flex-col space-y-2 p-2 type-body">
        <ExternalLink href={data?.website || ''}>View WCA competition webpage</ExternalLink>
        <div className="flex w-full flex-col rounded border border-slate-100 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="type-title">Venue</h2>
          <a
            className="link-inline flex w-full justify-between rounded align-center hover:opacity-80"
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
            <i className="fa fa-solid fa-arrow-up-right-from-square m-0" />
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
