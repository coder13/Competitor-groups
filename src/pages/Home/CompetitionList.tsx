import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReactLoading from 'react-loading';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import useWCAFetch from '../../hooks/useWCAFetch';
import { useAuth } from '../../providers/AuthProvider';
import { APICompetition } from '../../types';

const CompetitionLink = ({ id, name, start_date, country_iso2 }: APICompetition) => {
  return (
    <Link to={`/competitions/${id}`}>
      <li className="border bg-white list-none rounded-md px-1 py-1 flex cursor-pointer hover:bg-blue-200 group transition-colors my-1 flex-row">
        {hasFlag(country_iso2) && (
          <div className="flex flex-shrink mr-2 text-2xl"> {getUnicodeFlagIcon(country_iso2)} </div>
        )}{' '}
        <div className="flex-1">
          <p className="font-normal leading-1"> {name} </p>{' '}
          <p className="text-gray-600 text-sm leading-1"> {start_date} </p>{' '}
        </div>{' '}
      </li>{' '}
    </Link>
  );
};

export default function CompetitionList() {
  const wcaApiFetch = useWCAFetch();
  const { user } = useAuth();
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<APICompetition[]>([]);
  const [upcomingCompetitionsForUser, setUpcomingCompetitionsForUser] = useState<APICompetition[]>(
    []
  );
  const [loadingUpcomingCompetitions, setLoadingUpcomingCompetitions] = useState<boolean>(true);
  const [loadingUpcomingCompetitionsForUser, setLoadingUpcomingCompetitionsForUser] =
    useState<boolean>(true);
  const [errors, setErrors] = useState<any>([]);

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
      .then((competitions: APICompetition[]) => {
        if (competitions) {
          setUpcomingCompetitions(
            competitions.sort(
              (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
            )
          );
        }
      })
      .catch((err: any) => setErrors([...errors, err]))
      .finally(() => setLoadingUpcomingCompetitions(false));

    if (user) {
      getUpcomingCompetitionsForUser()
        .then(({ upcoming_competitions }: { upcoming_competitions: APICompetition[] }) => {
          setUpcomingCompetitionsForUser(
            upcoming_competitions.sort(
              (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
            )
          );
        })
        .catch((err: any) => setErrors([...errors, err]))
        .finally(() => setLoadingUpcomingCompetitionsForUser(false));
    }
  }, [getUpcomingCompetitions, user, getUpcomingCompetitionsForUser]);

  if (errors.length) {
    return (
      <div className="flex flex-col p-2 items-center">
        <div className="w-1/2 border rounded-md border-red-400 m-2 p-2">
          {errors.map((error: any) => error.toString())}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 items-center">
      {user && (
        <>
          {loadingUpcomingCompetitionsForUser ? (
            <ReactLoading type="balls" />
          ) : (
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl mb-2">Your Upcoming Competitions</h3>
              <ul className="px-0">
                {upcomingCompetitionsForUser.map((comp) => (
                  <CompetitionLink key={comp.id} {...comp} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      <br />
      {loadingUpcomingCompetitions ? (
        <ReactLoading type="balls" />
      ) : (
        <div className="w-full md:w-1/2">
          <h3 className="text-2xl mb-2">Upcoming Competitions</h3>
          <ul className="px-0">
            {upcomingCompetitions.map((comp) => (
              <CompetitionLink key={comp.id} {...comp} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
