import { useQuery } from '@tanstack/react-query';
import useWCAFetch from '../hooks/useWCAFetch';
import { useAuth } from '../providers/AuthProvider';
import CompetitionListFragment from './CompetitionList';
import { getLocalStorage, setLocalStorage } from '../lib/localStorage';
import { useEffect } from 'react';

interface UserCompsResponse {
  upcoming_competitions: ApiCompetition[];
  ongoing_competitions: ApiCompetition[];
}

export default function MyCompetitions() {
  const { user, expired, signIn } = useAuth();
  const wcaApiFetch = useWCAFetch();

  const { data, isFetching } = useQuery<UserCompsResponse>(
    ['userCompetitions'],
    async () =>
      await wcaApiFetch<UserCompsResponse>(
        `/users/${user?.id}?upcoming_competitions=true&ongoing_competitions=true`
      ),
    {
      cacheTime: 1000 * 60 * 5,
      initialData: () => {
        return {
          upcoming_competitions: getLocalStorage('my.upcoming_competitions')
            ? JSON.parse(getLocalStorage('my.upcoming_competitions') as string)
            : [],
          ongoing_competitions: getLocalStorage('my.ongoing_competitions')
            ? JSON.parse(getLocalStorage('my.ongoing_competitions') as string)
            : [],
        } as UserCompsResponse;
      },
    }
  );

  const competitions = [
    ...(data?.upcoming_competitions || []),
    ...(data?.ongoing_competitions || []),
  ].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  useEffect(() => {
    if (!data) {
      return;
    }

    setLocalStorage('my.upcoming_competitions', JSON.stringify(data.upcoming_competitions));
    setLocalStorage('my.ongoing_competitions', JSON.stringify(data.ongoing_competitions));
  }, [data]);

  console.log(52, getLocalStorage('expirationTime'));

  return (
    <>
      {expired && (
        <button
          onClick={() => signIn()}
          className="flex flex-col bg-orange-200 w-full rounded my-2 text-sm hover:underline text-left p-2 shadow hover:opacity-80">
          <span className="text-base">Session Expired</span>
          <span className="text-sm">Sign in again to refresh your competitions</span>
        </button>
      )}
      <CompetitionListFragment
        title="Your Upcoming Competitions"
        competitions={competitions}
        loading={isFetching}
      />
    </>
  );
}
