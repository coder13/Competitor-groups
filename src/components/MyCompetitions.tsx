import { useQuery } from '@tanstack/react-query';
import useWCAFetch from '../hooks/useWCAFetch';
import { useAuth } from '../providers/AuthProvider';
import CompetitionListFragment from './CompetitionList';

interface UserCompsResponse {
  upcoming_competitions: ApiCompetition[];
  ongoing_competitions: ApiCompetition[];
}

export default function MyCompetitions() {
  const { user } = useAuth();
  const wcaApiFetch = useWCAFetch();

  const { data, isFetching } = useQuery<UserCompsResponse>(
    ['userCompetitions'],
    async () =>
      await wcaApiFetch<UserCompsResponse>(
        `/users/${user?.id}?upcoming_competitions=true&ongoing_competitions=true`
      )
  );

  const competitions = [
    ...(data?.upcoming_competitions || []),
    ...(data?.ongoing_competitions || []),
  ].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return (
    <CompetitionListFragment
      title="Your Upcoming Competitions"
      competitions={competitions}
      loading={isFetching}
    />
  );
}
