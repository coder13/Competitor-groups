import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation, useParams } from 'react-router-dom';
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

  const ref = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: wcif, dataUpdatedAt, isFetching } = useWcif(competitionId!);

  const tabs = useCompetitionLayoutTabs({
    competitionId: competitionId!,
    wcif: wcif,
  });

  const currentTab = useMemo(
    () =>
      tabs.find((tab) => pathname === tab.href) ||
      tabs.find((tab) => pathname.startsWith(tab.href)),
    [tabs, pathname],
  );

  useEffect(() => {
    ref.current?.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const Header = (
    <nav className="z-10 flex justify-center w-full shadow-md shadow-tertiary-dark print:hidden bg-panel">
      <Container className="justify-between md:flex-row">
        <div className="flex w-full flex-col space-y-2 p-2 md:hidden">
          <button
            aria-expanded={isMobileMenuOpen}
            className="flex w-full items-center justify-between rounded-md border border-tertiary-weak bg-panel px-2 py-2"
            onClick={() => {
              setIsMobileMenuOpen((prev) => !prev);
            }}
            type="button">
            <span className="type-meta text-muted">Section</span>
            <span className="type-body text-primary">
              {currentTab?.text || tabs[0]?.text || 'Menu'}
            </span>
          </button>
          {isMobileMenuOpen && (
            <div className="grid grid-cols-2 gap-2">
              {tabs
                .filter((tab) => !tab.hiddenOnMobile)
                .map((i) => (
                  <StyledNavLink key={i.href} className="type-body-sm" to={i.href} text={i.text} />
                ))}
            </div>
          )}
        </div>
        <div className="hidden w-full p-2 md:flex">
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
