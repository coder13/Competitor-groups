import { createContext, useContext, useState, useEffect, useReducer, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useWCAFetch from '../../hooks/useWCAFetch';
import ReactLoading from 'react-loading';

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
              className="p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700">
              {wcif.name}
            </Link>
            <Link
              to={`/competitions/${wcif.id}/events`}
              className="p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700">
              Events
            </Link>
            <Link
              to={`/competitions/${wcif.id}/activities`}
              className="p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700">
              Schedule
            </Link>
            <Link
              to={`/competitions/${wcif.id}/scramblers`}
              className="p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700">
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
