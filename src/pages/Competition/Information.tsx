import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWCIF } from './WCIFProvider';
import useWCAFetch from '../../hooks/useWCAFetch';
import ExternalLink from '../../components/ExternalLink';

export default function Information() {
  const { setTitle, wcif } = useWCIF();
  const { competitionId } = useParams<{ competitionId: string }>();
  const wcaApiFetch = useWCAFetch();

  const { data, error, isFetching } = useQuery<ApiCompetition>({
    queryKey: ['competition', competitionId],
    queryFn: async () => wcaApiFetch<ApiCompetition>(`/competitions/${competitionId}`),
    networkMode: 'online',
    cacheTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setTitle('Information');
  }, [setTitle]);

  if (error) {
    return null;
  }

  if (isFetching) {
    return null;
  }

  return (
    <div className="flex flex-col w-full p-2 space-y-2 text-slate-800">
      <ExternalLink href={data?.website || ''}>View WCA competition webpage</ExternalLink>
      <div className="flex flex-col w-full border border-slate-100 p-2 rounded">
        <h2 className="text-2xl font-bold">Venue</h2>
        <a
          className="flex align-center justify-between w-full rounded hover:opacity-80 text-blue-600 hover:underline"
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
        <p>{data?.venue_details}</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Organizers</h2>
        <ul className="flex flex-col space-y-2">
          {data?.organizers?.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Delegates</h2>
        <ul className="flex flex-col space-y-2">
          {data?.delegates?.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </ul>
      </div>
    </div>
  );
}

const UserRow = ({ user }: { user: User }) => {
  return (
    <li className="w-full rounded flex border border-slate-400 space-x-2 justify-between hover:bg-slate-100 hover:border-slate-500 shadow transition-all">
      <a
        key={user.id}
        className="w-full flex"
        href={`https://www.worldcubeassociation.org/persons/${user.wca_id}`}
        target="_blank"
        rel="noreferrer">
        <img className="w-16 h-16 rounded-l" src={user.avatar?.thumb_url} alt={user.name} />
        <div className="flex flex-1 flex-col px-2">
          <span className="text-xl">{user.name}</span>
          <span className="text-xs">{user.wca_id}</span>
        </div>
        <div className="p-2 flex items-center">
          <i className="m-0 fa fa-solid fa-arrow-up-right-from-square" />
        </div>
      </a>
    </li>
  );
};
