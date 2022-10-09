import { useState, useEffect, useCallback } from 'react';
import ReactLoading from 'react-loading';
import useWCAFetch from '../hooks/useWCAFetch';
import { useAuth } from '../providers/AuthProvider';
import { byDate } from '../lib/utils';
import CompetitionLink from './CompetitionLink';

const CompetitionListFragment = ({ title, competitions }) => {
  return (
    <div className="w-full">
      <h3 className="text-2xl mb-2">{title}</h3>
      {competitions.length ? (
        <ul className="px-0">
          {competitions.sort(byDate).map((comp) => (
            <CompetitionLink key={comp.id} {...comp} />
          ))}
        </ul>
      ) : (
        <div>No Competitions</div>
      )}
    </div>
  );
};

export default function CompetitionList() {
  const wcaApiFetch = useWCAFetch();
  const { user } = useAuth();
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<ApiCompetition[]>([]);
  const [ongoingCompetitionsForUser, setOngoingCompetitionsForUser] = useState<ApiCompetition[]>(
    []
  );
  const [upcomingCompetitionsForUser, setUpcomingCompetitionsForUser] = useState<ApiCompetition[]>(
    []
  );
  const [loadingUpcomingCompetitions, setLoadingUpcomingCompetitions] = useState(true);
  const [loadingOngoingCompetitionsForUser, setLoadingOngoingCompetitionsForUser] = useState(true);
  const [loadingUpcomingCompetitionsForUser, setLoadingUpcomingCompetitionsForUser] =
    useState(true);
  const [errors, setErrors] = useState<any[]>([]);

  const getOngoingCompetitionsForUser = useCallback(
    () => wcaApiFetch(`/users/${user?.id}?ongoing_competitions=true`),
    [wcaApiFetch, user]
  );

  const getUpcomingCompetitionsForUser = useCallback(
    () => wcaApiFetch(`/users/${user?.id}?upcoming_competitions=true`),
    [wcaApiFetch, user]
  );

  const getUpcomingCompetitions = useCallback(() => {
    const oneWeekAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekFuture = new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      start: oneWeekAgo.toISOString(),
      end: oneWeekFuture.toISOString(),
      sort: 'start_date',
    });
    return wcaApiFetch(`/competitions?${params.toString()}`);
  }, [wcaApiFetch]);

  useEffect(() => {
    getUpcomingCompetitions()
      .then((competitions) => {
        setUpcomingCompetitions(competitions);
      })
      .catch((err) => setErrors([...errors, err]))
      .finally(() => setLoadingUpcomingCompetitions(false));

    if (user) {
      getOngoingCompetitionsForUser()
        .then(({ ongoing_competitions }) => {
          setOngoingCompetitionsForUser(ongoing_competitions);
        })
        .catch((err) => setErrors([...errors, err]))
        .finally(() => setLoadingOngoingCompetitionsForUser(false));

      getUpcomingCompetitionsForUser()
        .then(({ upcoming_competitions }) => {
          setUpcomingCompetitionsForUser(upcoming_competitions);
        })
        .catch((err) => setErrors([...errors, err]))
        .finally(() => setLoadingUpcomingCompetitionsForUser(false));
    }
  }, [
    getUpcomingCompetitions,
    user,
    getUpcomingCompetitionsForUser,
    getOngoingCompetitionsForUser,
    errors,
  ]);

  if (errors.length) {
    return (
      <div className="flex flex-col p-2 items-center">
        <div className="w-1/2 border rounded-md border-red-400 m-2 p-2">
          {errors.map((error) => error.toString())}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 items-center">
      {user && (
        <>
          {loadingUpcomingCompetitionsForUser && loadingOngoingCompetitionsForUser ? (
            <ReactLoading type="balls" />
          ) : (
            <CompetitionListFragment
              title="Your Upcoming Competitions"
              competitions={[
                ...(ongoingCompetitionsForUser || []),
                ...(upcomingCompetitionsForUser || []),
              ].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())}
            />
          )}
        </>
      )}
      <br />
      {loadingUpcomingCompetitions ? (
        <ReactLoading type="balls" />
      ) : (
        <CompetitionListFragment
          title="Upcoming Competitions"
          competitions={upcomingCompetitions}
        />
      )}
    </div>
  );
}
