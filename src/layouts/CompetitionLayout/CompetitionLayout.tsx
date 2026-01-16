import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { ErrorFallback, LastFetchedAt, NoteBox } from '@/components';
import { Container } from '@/components/Container';
import { StyledNavLink } from '@/containers/StyledNavLink/StyledNavLink';
import { useWcif } from '@/hooks/queries/useWcif';
import { useApp } from '@/providers/AppProvider';
import { WCIFProvider } from '@/providers/WCIFProvider';
import { useCompetitionLayoutTabs } from './CompetitionLayout.tabs';
import { CompetitionTabsSheet } from './CompetitionTabsSheet';

export function CompetitionLayout() {
  const { t } = useTranslation();
  const { online } = useApp();
  const { competitionId } = useParams();
  const { pathname } = useLocation();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: wcif, dataUpdatedAt, isFetching } = useWcif(competitionId!);

  const { desktopTabs, mobileTabs, overflowTabs } = useCompetitionLayoutTabs({
    competitionId: competitionId!,
    wcif: wcif,
  });

  useEffect(() => {
    ref.current?.scrollTo(0, 0);
    setIsSheetOpen(false);
  }, [pathname]);

  const Header = (
    <nav className="z-10 flex justify-center w-full shadow-md shadow-tertiary-dark print:hidden bg-panel">
      <Container className="justify-between md:flex-row">
        <div className="hidden w-full md:flex">
          {desktopTabs.map((tab) => (
            <StyledNavLink key={tab.href} to={tab.href} text={tab.text} />
          ))}
        </div>
        <div className="flex w-full md:hidden">
          {mobileTabs.map((tab) => (
            <StyledNavLink key={tab.href} to={tab.href} text={tab.text} />
          ))}
          <button
            type="button"
            className={classNames('link-nav', {
              'bg-tertiary-strong text-blue-700 dark:text-blue-300 shadow-lg shadow-tertiary-dark':
                isSheetOpen,
            })}
            onClick={() => setIsSheetOpen(true)}>
            {t('header.tabs.more')}
          </button>
        </div>
      </Container>
    </nav>
  );

  return (
    <WCIFProvider competitionId={competitionId}>
      <div className="flex flex-col w-full h-full overflow-hidden">
        {Header}
        <CompetitionTabsSheet
          open={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          tabs={overflowTabs}
          title={t('header.tabs.more')}
        />

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
          className="flex flex-col w-full items-center overflow-y-auto [scrollbar-gutter:stable;]"
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
      </div>
    </WCIFProvider>
  );
}
