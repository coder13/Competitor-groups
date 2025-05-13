import { useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { ErrorFallback, LastFetchedAt, NoteBox } from '@/components';
import { Container } from '@/components/Container';
import { StyledNavLink } from '@/containers/StyledNavLink/StyledNavLink';
import { useWcif } from '@/hooks/queries/useWcif';
import { useApp } from '@/providers/AppProvider';
import { WCIFProvider } from '@/providers/WCIFProvider';
import { useCompetitionLayoutTabs } from './CompetitionLayout.tabs';

export function CompetitionLayout() {
  const { online } = useApp();
  const { competitionId } = useParams();
  const { pathname } = useLocation();

  const ref = useRef<HTMLDivElement>(null);

  const { data: wcif, dataUpdatedAt, isFetching } = useWcif(competitionId!);

  const tabs = useCompetitionLayoutTabs({
    competitionId: competitionId!,
    wcif: wcif,
  });

  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [pathname]);

  const Header = (
    <nav className="flex shadow-md print:hidden w-full justify-center z-10">
      <Container className="md:flex-row justify-between">
        <div className="flex">
          {tabs.map((i) => (
            <StyledNavLink key={i.href} to={i.href} text={i.text} />
          ))}
        </div>
      </Container>
    </nav>
  );

  return (
    <WCIFProvider competitionId={competitionId}>
      <div className="flex flex-col w-full h-full overflow-hidden">
        {Header}

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
        <div
          className="flex flex-col w-full items-center overflow-y-auto [scrollbar-gutter:stable;]"
          ref={ref}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet />
          </ErrorBoundary>
          {!!dataUpdatedAt && (
            <Container className="py-2 px-1">
              {<LastFetchedAt lastFetchedAt={new Date(dataUpdatedAt)} />}
            </Container>
          )}
        </div>
      </div>
    </WCIFProvider>
  );
}
