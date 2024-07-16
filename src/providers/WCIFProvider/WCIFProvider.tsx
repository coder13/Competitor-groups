import { useContext, useState, useEffect, useMemo } from 'react';
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
import ReactGA from 'react-ga4';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../components/ErrorFallback';
import { useAuth } from '../AuthProvider';
import { isStaff } from '../../lib/person';

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
  const { user } = useAuth();
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

    if (ReactGA.isInitialized) {
      ReactGA.set({
        competitionId,
        content_group: competitionId,
      });
    }

    return () => {
      if (ReactGA.isInitialized) {
        ReactGA.set({
          competitionId: null,
          content_group: null,
        });
      }
    };
  }, [wcif, title]);

  const hasStream = wcif && streamActivities(wcif).length > 0;
  const person = wcif?.persons.find((p) => p.wcaUserId === user?.id);
  const isPersonStaff = person && !isStaff(person);

  if (error) {
    <div className="flex">
      <p>Error loading competition: </p>
      <p>{error?.toString()}</p>
    </div>;
  }

  const tabs = useMemo(() => {
    const _tabs: {
      href: string;
      text: string;
    }[] = [];

    if (!isPersonStaff) {
      _tabs.push({
        href: `/competitions/${competitionId}`,
        text: 'Groups',
      });
    }

    _tabs.push(
      {
        href: `/competitions/${competitionId}/events`,
        text: 'Events',
      },
      {
        href: `/competitions/${competitionId}/activities`,
        text: 'Schedule',
      }
    );

    if (isPersonStaff) {
      _tabs.push({
        href: `/competitions/${competitionId}/scramblers`,
        text: 'Scramblers',
      });
    }

    if (isPersonStaff && hasStream) {
      _tabs.push({
        href: `/competitions/${competitionId}/stream`,
        text: 'Stream',
      });
    }

    return _tabs;
  }, [competitionId]);

  return (
    <WCIFContext.Provider value={{ wcif: wcif as Competition, setTitle }}>
      <div className="flex flex-col w-full h-full overflow-hidden">
        <nav className="flex shadow-md print:hidden w-full justify-center z-10">
          <Container className="md:flex-row justify-between">
            <div className="flex">
              <StyledNavLink to={`/competitions/${competitionId}`} text={wcif?.shortName} />
            </div>
            <div className="flex">
              {tabs.map((i) => (
                <StyledNavLink
                  key={i.href}
                  to={`/competitions/${competitionId}/events`}
                  text={i.text}
                />
              ))}
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
          <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
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
