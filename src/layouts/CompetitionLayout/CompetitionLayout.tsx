import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { ErrorFallback, LastFetchedAt, NoteBox, NotifyCompRemoteBar } from '@/components';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { StyledNavLink } from '@/components/StyledNavLink/StyledNavLink';
import { useWcif } from '@/hooks/queries/useWcif';
import { useCompetitionAnalytics } from '@/hooks/useCompetitionAnalytics';
import { useApp } from '@/providers/AppProvider';
import { WCIFProvider } from '@/providers/WCIFProvider';
import { useCompetitionLayoutTabs } from './CompetitionLayout.tabs';

export function CompetitionLayout() {
  const { t } = useTranslation();
  const { online } = useApp();
  const { competitionId } = useParams();
  const { pathname } = useLocation();

  const ref = useRef<HTMLDivElement>(null);

  const { data: wcif, dataUpdatedAt, isFetching, error, refetch } = useWcif(competitionId!);

  useCompetitionAnalytics(competitionId);

  const { tabs } = useCompetitionLayoutTabs({
    competitionId: competitionId!,
    wcif: wcif,
  });

  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [pathname]);

  const Header = (
    <nav className="z-10 flex justify-center w-full shadow-md shadow-tertiary-dark print:hidden bg-panel">
      <Container className="justify-between md:flex-row">
        <div className="flex">
          {tabs.map((i) => (
            <StyledNavLink
              key={i.href}
              className={classNames({
                'hidden md:block': i.hiddenOnMobile,
              })}
              end={i.end}
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
        {wcif && Header}

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
          className="safe-area-scroll-bottom flex flex-1 flex-col w-full items-center overflow-y-auto [scrollbar-gutter:stable;]"
          ref={ref}>
          {!wcif && isFetching && (
            <Container className="p-4">
              <p role="status">{t('common.loading')}</p>
            </Container>
          )}
          {error && (
            <Container className="p-4 space-y-2">
              <div role="alert" className="space-y-2">
                <p>{t(wcif ? 'competition.refreshError' : 'competition.loadError')}</p>
                {!wcif && <p>{t('competition.loadErrorHint')}</p>}
                <div className="flex gap-2">
                  <Button onClick={() => void refetch()} disabled={isFetching}>
                    {t('common.retry')}
                  </Button>
                  {!wcif && (
                    <Link to="/" className="btn btn-gray">
                      {t('common.home')}
                    </Link>
                  )}
                </div>
              </div>
            </Container>
          )}
          {wcif && (
            <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[competitionId]}>
              <Outlet />
            </ErrorBoundary>
          )}
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
        {wcif && competitionId && <NotifyCompRemoteBar competitionId={competitionId} />}
      </div>
    </WCIFProvider>
  );
}
