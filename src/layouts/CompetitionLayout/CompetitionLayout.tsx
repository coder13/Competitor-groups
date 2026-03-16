import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { ErrorFallback, LastFetchedAt, NoteBox } from '@/components';
import { Container } from '@/components/Container';
import { StyledNavLink } from '@/containers/StyledNavLink/StyledNavLink';
import { useCompetitionTabLinks } from '@/hooks/queries/useCompetitionTabs';
import { useWcif } from '@/hooks/queries/useWcif';
import { useApp } from '@/providers/AppProvider';
import { WCIFProvider } from '@/providers/WCIFProvider';
import { CompetitionBottomTabs } from './CompetitionBottomTabs';
import { useCompetitionLayoutTabs } from './CompetitionLayout.tabs';
import { CompetitionTabsSheet } from './CompetitionTabsSheet';
import { TabsDropdownList } from './TabsDropdownList';

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

  const { data: tabLinks } = useCompetitionTabLinks(competitionId);

  const tabsPanels = useMemo(() => tabLinks.map(({ href, text }) => ({ href, text })), [tabLinks]);

  useEffect(() => {
    ref.current?.scrollTo(0, 0);
    setIsSheetOpen(false);
  }, [pathname]);

  const Header = (
    <nav className="z-10 justify-center hidden w-full shadow-md md:flex shadow-tertiary-dark print:hidden bg-panel">
      <Container className="w-full">
        <div
          className="grid items-center w-full gap-2"
          style={{
            gridTemplateColumns: `repeat(${desktopTabs.length + 1}, minmax(0, 1fr))`,
          }}>
          {desktopTabs.map((tab) => (
            <StyledNavLink key={tab.href} to={tab.href} text={tab.text} />
          ))}
          <div className="relative group">
            <button type="button" className="flex items-center gap-2 link-nav">
              {t('header.tabs.extraInfo')}
              <i className="text-xs fa fa-chevron-down" aria-hidden="true" />
            </button>
            <div className="absolute right-0 hidden w-56 pt-2 group-hover:block group-focus-within:block before:absolute before:-top-2 before:left-0 before:h-2 before:w-full before:content-['']">
              <div className="rounded-lg border border-tertiary-weak bg-white p-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <TabsDropdownList competitionId={competitionId!} onNavigate={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );

  return (
    <WCIFProvider competitionId={competitionId}>
      <div className="flex flex-col w-full h-full min-h-full overflow-hidden">
        {Header}
        <CompetitionTabsSheet
          open={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          tabs={overflowTabs}
          tabPanels={tabsPanels}
          tabPanelsTitle={t('header.tabs.extraInfoOptions')}
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
          className="flex flex-col w-full items-center overflow-y-auto [scrollbar-gutter:stable;] pb-28 md:pb-0"
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
        <CompetitionBottomTabs
          tabs={mobileTabs}
          onOpenMore={() => setIsSheetOpen(true)}
          moreLabel={t('header.tabs.more')}
          isMoreOpen={isSheetOpen}
        />
      </div>
    </WCIFProvider>
  );
}
