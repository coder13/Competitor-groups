import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { UserPageTab } from '../userProfileData';

interface ProfileTabsProps {
  activeTab: UserPageTab;
}

const tabs: { id: UserPageTab; label: string }[] = [
  { id: 'competitions', label: 'Competitions' },
  { id: 'results', label: 'Results' },
  { id: 'records', label: 'Records' },
];

const tabPath = (tab: UserPageTab) => `/me/${tab}`;

export function ProfileTabs({ activeTab }: ProfileTabsProps) {
  return (
    <nav className="overflow-hidden rounded-md border border-tertiary-weak bg-panel shadow-sm">
      <div className="grid grid-flow-col auto-cols-fr">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <Link
              key={tab.id}
              to={tabPath(tab.id)}
              className={classNames(
                'flex min-h-12 items-center justify-center gap-2 border-r border-tertiary-weak px-2 py-2 text-center type-body-sm hover-transition hover:bg-gray-100 last:border-r-0 dark:hover:bg-gray-700 sm:type-body',
                {
                  'bg-active text-primary': isActive,
                  'text-muted': !isActive,
                },
              )}>
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
