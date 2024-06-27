import { createContext, useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Competition } from '@wca/helpers';
import { BarLoader } from 'react-spinners';
import { GlobalStateContext } from '../App';
import NoteBox from '../components/Notebox';
import { streamActivities } from '../lib/activities';
import { Container } from '../components/Container';
import { LastFetchedAt } from '../components/LastFetchedAt';
import { useWcif } from '../hooks/queries/useWcif';
import { queryClient } from './QueryProvider';
import { prefetchCompetition } from '../hooks/queries/useCompetition';

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
    competitorLimit: 0,
    extensions: [],
  },
  setTitle: () => {},
});

export default function WCIFProvider({ competitionId, children }) {
  const { online } = useContext(GlobalStateContext);
  const [title, setTitle] = useState('');
  const { data: wcif, error, isFetching, dataUpdatedAt } = useWcif(competitionId);

  useEffect(() => {
    void prefetchCompetition(competitionId);
  }, [competitionId]);

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
      <div className="flex flex-col w-full h-full">
        <nav className="flex shadow-md print:hidden w-full justify-center">
          <Container className="md:flex-row justify-between">
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
          </Container>
        </nav>
        {!online && (
          <div className="flex flex-col w-full items-center my-2">
            <Container>
              <NoteBox
                text="This app is operating in offline mode. Some data may be outdated."
                prefix=""
              />
            </Container>
          </div>
        )}
        <div className="flex flex-col w-full items-center">
          {isFetching ? <BarLoader width="100%" /> : <div style={{ height: '4px' }} />}

          {children}
          {!!dataUpdatedAt && (
            <Container className="py-2">
              {<LastFetchedAt lastFetchedAt={new Date(dataUpdatedAt)} />}
            </Container>
          )}
        </div>
      </div>
    </WCIFContext.Provider>
  );
}

export const useWCIF = () => useContext(WCIFContext);

export const useWcifUtils = () => {
  const { wcif } = useWCIF();

  const rooms = wcif?.schedule?.venues?.flatMap((venue) => venue.rooms) || [];
  const roundActivies = rooms.flatMap((room) => room.activities);
  const childActivities = roundActivies.flatMap((activity) => activity.childActivities);
  const acceptedPersons =
    wcif?.persons?.filter((person) => person.registration?.status === 'accepted') || [];

  return { rooms, roundActivies, childActivities, acceptedPersons };
};
