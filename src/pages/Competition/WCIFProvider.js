import { createContext, useContext, useState, useEffect, useReducer, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useWCAFetch from '../../hooks/useWCAFetch';
import ReactLoading from 'react-loading';
import clsx from 'clsx';

const INITIAL_STATE = {
  id: undefined,
  name: undefined,
  persons: [],
  events: [],
  schedule: {
    venues: [],
  },
};

const WCIFContext = createContext();

function WCIFReducer(state, { type, payload }) {
  switch (type) {
    case 'SET':
      return {
        ...payload,
      };
    default: {
      throw new Error(`Unhandled action type ${type}`);
    }
  }
}

export default function WCIFProvider({ competitionId, children }) {
  const [wcif, dispatch] = useReducer(WCIFReducer, INITIAL_STATE);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const wcaApiFetch = useWCAFetch();
  const location = useLocation();
  const page = location.pathname.split('/').pop();

  const fetchCompetition = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wcaApiFetch(`/competitions/${competitionId}/wcif/public`);
      dispatch({
        type: 'SET',
        payload: data,
      });
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError(e);
      setLoading(false);
    }
  }, [competitionId, wcaApiFetch]);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  if (error) {
    <div className="flex">
      <p>Error loading competition: </p>
      <p>{error.toString}</p>
    </div>;
  }

  return (
    <WCIFContext.Provider value={{ wcif, fetchCompetition, error, dispatch }}>
      {loading && !error ? (
        <ReactLoading type="cubes" />
      ) : (
        <div className="flex flex-col w-full h-full">
          <div className="flex flex-row shadow-md pl-2 print:hidden">
            <Link
              to={`/competitions/${wcif.id}`}
              className={clsx(`p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700`, {
                'bg-gray-100 text-blue-700 shadow-lg': page === wcif.id,
              })}>
              {wcif.name}
            </Link>
            <Link
              to={`/competitions/${wcif.id}/events`}
              className={clsx(`p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700`, {
                'bg-gray-100 text-blue-700 shadow-lg': page === 'events',
              })}>
              Events
            </Link>
            <Link
              to={`/competitions/${wcif.id}/activities`}
              className={clsx(`p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700`, {
                'bg-gray-100 text-blue-700 shadow-lg': page === 'activities',
              })}>
              Schedule
            </Link>
            <Link
              to={`/competitions/${wcif.id}/scramblers`}
              className={clsx(`p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700`, {
                'bg-gray-100 text-blue-700 shadow-lg': page === 'scramblers',
              })}>
              Scramblers
            </Link>
          </div>
          <div className="flex flex-col w-full items-center">
            <div className="w-full md:w-1/2">{children}</div>
          </div>
        </div>
      )}
    </WCIFContext.Provider>
  );
}

export const useWCIF = () => useContext(WCIFContext);
