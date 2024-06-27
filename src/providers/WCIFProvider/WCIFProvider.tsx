import { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Competition } from '@wca/helpers';
import { BarLoader } from 'react-spinners';
import { GlobalStateContext } from '../../App';
import NoteBox from '../../components/Notebox';
import { streamActivities } from '../../lib/activities';
import { Container } from '../../components/Container';
import { LastFetchedAt } from '../../components/LastFetchedAt';
import { useWcif } from '../../hooks/queries/useWcif';
import { prefetchCompetition } from '../../hooks/queries/useCompetition';
import { WCIFContext } from './WCIFContext';

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

export function WCIFProvider({ competitionId, children }) {
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
      <div className="flex flex-col w-full h-full overflow-hidden">
        <nav className="flex shadow-md print:hidden w-full justify-center z-10">
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
        {isFetching ? <BarLoader width="100%" /> : <div style={{ height: '4px' }} />}
        <div className="flex flex-col w-full items-center overflow-auto">
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
