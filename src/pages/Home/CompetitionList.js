import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useWCAFetch from '../../hooks/useWCAFetch';

const CompetitionLink = ({ comp, ...props }) => (
  <li>
    <Link to={`/competitions/${comp.id}`}>
      {comp.name} ({comp.start_date})
    </Link>
  </li>
);

export default function CompetitionList() {
  const wcaApiFetch = useWCAFetch();
  const [upcomingCompetitions, setUpcomingCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    
  const getUpcomingCompetitions = useCallback(() => {
    const oneWeekAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekFuture = new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      start: oneWeekAgo.toISOString(),
      end: oneWeekFuture.toISOString(),
      sort: 'start_date'
    });
    return wcaApiFetch(`/competitions?${params.toString()}`);
  }, [wcaApiFetch]);
  
  useEffect(() => {
    getUpcomingCompetitions()
      .then((competitions) => {
        setUpcomingCompetitions(competitions.sort((a,b) => new Date(a.start_date) - new Date(b.start_date)));
      })
      .catch(error => setError(error.message))
      .finally(() => setLoading(false));
  }, [getUpcomingCompetitions]);

  return (
    <div>
      <h2>My Competitions</h2>

      <div>
        <h3>Upcoming Competitions</h3>

        {upcomingCompetitions.map((comp) =>
          <CompetitionLink key={comp.id} comp={comp}/>
        )}
      </div>
    </div>
  );
};
