import { createContext, useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Competition } from '@wca/helpers';
import useWCAFetch from '../../hooks/useWCAFetch';
import { BarLoader } from 'react-spinners';
import { useQuery } from '@tanstack/react-query';
import { GlobalStateContext } from '../../App';
import NoteBox from '../../components/Notebox';
import { streamActivities } from './../../lib/activities';

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
  wcif?: Competition;
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

export default function WCIFProvider({ competitionId, children }) {
  const { online } = useContext(GlobalStateContext);
  const [title, setTitle] = useState('');
  const wcaApiFetch = useWCAFetch();
  const {
    data: wcif,
    error,
    isFetching,
  } = useQuery<Competition>({
    queryKey: ['wcif', competitionId],
    queryFn: () =>
      wcaApiFetch(`/competitions/${competitionId}/wcif/public`, {
        cache: 'force-cache',
      }),
    networkMode: 'online',
  });

  useEffect(() => {
    if (wcif) {
      document.title = title
        ? `${title} - ${wcif.shortName} - Competition Groups`
        : `${wcif.shortName} - Competition Groups`;
    }
  }, [wcif, title]);

  const hasStream = wcif && streamActivities(wcif).length > 0;

  if (error) {
    <div className="flex">
      <p>Error loading competition: </p>
      <p>{error?.toString()}</p>
    </div>;
  }

  return (
    <WCIFContext.Provider value={{ wcif: wcif as Competition, setTitle }}>
      {!online && (
        <NoteBox
          text="This app is operating in offline mode. Some data may be outdated."
          prefix=""
        />
      )}
      <div className="flex flex-col w-full h-full">
        <nav className="flex shadow-md print:hidden w-full justify-center">
          <div className="lg:w-1/2 md:w-2/3 w-full flex flex-col md:flex-row justify-between">
            <div className="flex">
              <StyledNavLink to={`/competitions/${competitionId}`} text={wcif?.shortName} />
            </div>
            <div className="flex">
              <StyledNavLink to={`/competitions/${competitionId}/events`} text="Events" />
              <StyledNavLink to={`/competitions/${competitionId}/activities`} text="Schedule" />
              <StyledNavLink to={`/competitions/${competitionId}/scramblers`} text="Scramblers" />
              {hasStream && (
                <StyledNavLink to={`/competitions/${competitionId}/stream`} text="Stream" />
              )}
            </div>
          </div>
        </nav>
        <div className="flex flex-col w-full items-center">
          {isFetching ? <BarLoader width="100%" /> : <div style={{ height: '4px' }} />}
          {<div className="w-full lg:w-1/2 md:w-2/3">{children}</div>}
        </div>
      </div>
    </WCIFContext.Provider>
  );
}

export const useWCIF = () => useContext(WCIFContext);
