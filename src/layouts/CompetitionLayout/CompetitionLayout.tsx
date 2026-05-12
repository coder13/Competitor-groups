import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { ErrorFallback, LastFetchedAt, NoteBox, NotifyCompRemoteBar } from '@/components';
import { Container } from '@/components/Container';
import { StyledNavLink } from '@/components/StyledNavLink/StyledNavLink';
import { useWcif } from '@/hooks/queries/useWcif';
import { useApp } from '@/providers/AppProvider';
import { WCIFProvider } from '@/providers/WCIFProvider';
import { useCompetitionLayoutTabs } from './CompetitionLayout.tabs';

export function CompetitionLayout() {
  const { online } = useApp();
  const { competitionId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
    <nav className="z-10 flex justify-center w-full shadow-md shadow-tertiary-dark print:hidden bg-panel">
      <Container className="justify-between md:flex-row space-y-2 md:space-y-0">
        <div className="flex md:hidden w-full p-2">
          <label className="flex w-full items-center space-x-2" htmlFor="competition-section-nav">
            <span className="type-meta text-muted">Section</span>
            <select
              className="w-full rounded-md border border-tertiary-weak bg-panel p-2"
              id="competition-section-nav"
              onChange={(event) => {
                void navigate(event.target.value);
              }}
              value={pathname}>
              {tabs
                .filter((tab) => !tab.hiddenOnMobile)
                .map((tab) => (
                  <option key={tab.href} value={tab.href}>
                    {tab.text}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <div className="hidden md:flex">
          {tabs.map((i) => (
            <StyledNavLink
              key={i.href}
              className={classNames({
                'hidden md:block': i.hiddenOnMobile,
              })}
              to={i.href}
              text={i.text}
            />
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
          <div className="flex flex-col items-center w-full my-2">
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
          className="flex flex-1 flex-col w-full items-center overflow-y-auto [scrollbar-gutter:stable;]"
          ref={ref}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet />
          </ErrorBoundary>
          {!!dataUpdatedAt && (
            <Container className="p-2 print:hidden">
              <div className="flex space-x-2">
                <div className="type-meta">{__GIT_COMMIT__}</div>
                <div className="flex flex-grow" />
                {<LastFetchedAt lastFetchedAt={new Date(dataUpdatedAt)} />}
              </div>
            </Container>
          )}
        </div>
        {competitionId && <NotifyCompRemoteBar competitionId={competitionId} />}
      </div>
    </WCIFProvider>
  );
}
