import { Person } from '@wca/helpers';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '@/components/Container';
import { PersonHeader } from './PersonHeader';

export type PersonalPage = 'schedule' | 'results' | 'records';

interface PersonalPageLayoutProps {
  activePage: PersonalPage;
  children: React.ReactNode;
  competitionId: string;
  person: Person;
}

interface PersonalPageTab {
  id: PersonalPage;
  iconClassName: string;
  label: string;
  to: string;
}

const usePersonalPageTabs = (competitionId: string, person: Person) => {
  const { t } = useTranslation();

  return [
    {
      id: 'schedule',
      iconClassName: 'fa-calendar-days',
      label: t('competition.personalSchedule.schedule'),
      to: `/competitions/${competitionId}/persons/${person.registrantId}`,
    },
    {
      id: 'results',
      iconClassName: 'fa-chart-simple',
      label: t('competition.personalSchedule.results'),
      to: `/competitions/${competitionId}/persons/${person.registrantId}/results`,
    },
    ...(person.wcaId
      ? [
          {
            id: 'records' as const,
            iconClassName: 'fa-trophy',
            label: t('competition.personalSchedule.records'),
            to: `/competitions/${competitionId}/persons/${person.registrantId}/records`,
          },
        ]
      : []),
  ] satisfies PersonalPageTab[];
};

function PersonalPageTabs({
  activePage,
  tabs,
}: {
  activePage: PersonalPage;
  tabs: PersonalPageTab[];
}) {
  return (
    <nav className="overflow-hidden rounded-md border border-tertiary-weak bg-panel shadow-sm">
      <div className="grid grid-flow-col auto-cols-fr">
        {tabs.map((tab) => {
          const isActive = tab.id === activePage;

          return (
            <Link
              key={tab.id}
              to={tab.to}
              className={classNames(
                'flex min-h-12 items-center justify-center gap-2 border-r border-tertiary-weak px-2 py-2 text-center type-body-sm hover-transition hover:bg-gray-100 last:border-r-0 dark:hover:bg-gray-700 sm:type-body',
                {
                  'bg-active text-primary': isActive,
                  'text-muted': !isActive,
                },
              )}>
              <span className={`fa ${tab.iconClassName}`} aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PersonalPageLayout({
  activePage,
  children,
  competitionId,
  person,
}: PersonalPageLayoutProps) {
  const tabs = usePersonalPageTabs(competitionId, person);

  return (
    <div className="w-full pt-4">
      <Container className="mx-auto w-full">
        <div className="flex flex-col space-y-4 p-2 type-body">
          <PersonHeader competitionId={competitionId} person={person} />
          <PersonalPageTabs activePage={activePage} tabs={tabs} />
          {children}
        </div>
      </Container>
    </div>
  );
}
