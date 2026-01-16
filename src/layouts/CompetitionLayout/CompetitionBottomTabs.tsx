import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { CompetitionLayoutTabItem } from './CompetitionLayout.tabs';

interface CompetitionBottomTabsProps {
  tabs: CompetitionLayoutTabItem[];
  onOpenMore: () => void;
  moreLabel: string;
  isMoreOpen: boolean;
}

const getTabIcon = (href: string) => {
  if (href.includes('/events')) return 'fa-calendar-days';
  if (href.includes('/activities')) return 'fa-clock';
  if (href.includes('/psych-sheet')) return 'fa-chart-line';
  if (href.includes('/scramblers')) return 'fa-shuffle';
  if (href.includes('/stream')) return 'fa-video';
  if (href.includes('/information')) return 'fa-circle-info';
  if (href.includes('/tabs')) return 'fa-table-cells';
  return 'fa-users';
};

export const CompetitionBottomTabs = ({
  tabs,
  onOpenMore,
  moreLabel,
  isMoreOpen,
}: CompetitionBottomTabsProps) => {
  const itemBaseClass =
    'flex flex-1 min-w-0 flex-col items-center justify-center gap-1 border-t-2 border-transparent px-2 py-2 text-center min-h-10';
  const iconBaseClass = 'text-lg leading-none';
  const labelBaseClass = 'text-[10px] font-medium';

  return (
    <div className="md:hidden">
      <div className="fixed inset-x-0 bottom-0 z-20 w-full border-t shadow-lg border-tertiary-weak bg-panel shadow-tertiary-dark">
        <div className="mx-auto grid w-full max-w-screen-md grid-cols-[repeat(auto-fit,minmax(0,1fr))] items-stretch">
          {tabs.map((tab) => (
            <NavLink
              key={tab.href}
              to={tab.href}
              className={({ isActive }) =>
                classNames(itemBaseClass, {
                  'border-t-blue-600 text-blue-600 dark:text-blue-300': isActive,
                  'text-slate-600 dark:text-slate-300': !isActive,
                })
              }>
              {({ isActive }) => (
                <>
                  <i
                    aria-hidden="true"
                    className={classNames('fa', getTabIcon(tab.href), iconBaseClass, {
                      'text-blue-600 dark:text-blue-300': isActive,
                      'text-slate-700 dark:text-slate-200': !isActive,
                    })}
                  />
                  <span
                    className={classNames(labelBaseClass, {
                      'text-blue-600 dark:text-blue-300': isActive,
                      'text-slate-500 dark:text-slate-400': !isActive,
                    })}>
                    {tab.text}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            className={classNames(itemBaseClass, {
              'border-blue-600 text-blue-600 dark:text-blue-300': isMoreOpen,
              'text-slate-600 dark:text-slate-300': !isMoreOpen,
            })}
            onClick={onOpenMore}>
            <i
              aria-hidden="true"
              className={classNames('fa fa-ellipsis', iconBaseClass, {
                'text-blue-600 dark:text-blue-300': isMoreOpen,
                'text-slate-700 dark:text-slate-200': !isMoreOpen,
              })}
            />
            <span
              className={classNames(labelBaseClass, {
                'text-blue-600 dark:text-blue-300': isMoreOpen,
                'text-slate-500 dark:text-slate-400': !isMoreOpen,
              })}>
              {moreLabel}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
