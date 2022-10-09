import { createContext, useContext, useState, useEffect, useReducer, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import ReactLoading from 'react-loading';
import clsx from 'clsx';
import { Competition } from '@wca/helpers';
import useWCAFetch from '../../hooks/useWCAFetch';

const StyledNavLink = ({ to, text }) => (
  <NavLink
    end
    to={to}
    className={({ isActive }) =>
      clsx(`p-2 text-blue-500 hover:bg-gray-50 hover:text-blue-700 w-full text-center`, {
        'bg-gray-100 text-blue-700 shadow-lg': isActive,
      })
    }>
    {text}
  </NavLink>
);

interface IWCIFContextType {
  wcif: Competition;
  setTitle: (title: string) => void;
}

const WCIFContext = createContext<IWCIFContextType>({
  wcif: {
    formatVersion: '1.0',
    id: '',
    name: '',
    shortName: '',
    events: [],
    persons: [],
    schedule: {
      numberOfDays: 0,
      startDate: '',
      venues: [],
    },
  },
  setTitle: () => {},
});

function WCIFReducer(_: Competition, { type, payload }) {
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
  const [wcif, dispatch] = useReducer(WCIFReducer, null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const wcaApiFetch = useWCAFetch();

  useEffect(() => {
    if (wcif) {
      document.title = title
        ? `${title} - ${wcif.shortName} - Competition Groups`
        : `${wcif.shortName} - Competition Groups`;
    }
  }, [wcif, title]);

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
      <p>{error?.toString()}</p>
    </div>;
  }

  if (loading && !error) {
    // TODO Fix this
    return <ReactLoading type="cubes" />;
  }

  return (
    <WCIFContext.Provider value={{ wcif, setTitle }}>
      <div className="flex flex-col w-full h-full">
        <nav className="flex shadow-md print:hidden w-full justify-center">
          <div className="lg:w-1/2 w-full flex flex-col md:flex-row justify-between">
            <div className="flex">
              <StyledNavLink to={`/competitions/${competitionId}`} text={wcif.shortName} />
            </div>
            <div className="flex">
              <StyledNavLink to={`/competitions/${competitionId}/events`} text="Events" />
              <StyledNavLink to={`/competitions/${competitionId}/activities`} text="Schedule" />
              <StyledNavLink to={`/competitions/${competitionId}/scramblers`} text="Scramblers" />
            </div>
          </div>
        </nav>
        <div className="flex flex-col w-full items-center">
          <div className="w-full md:w-1/2">{children}</div>
        </div>
      </div>
    </WCIFContext.Provider>
  );
}

export const useWCIF = () => useContext(WCIFContext);
