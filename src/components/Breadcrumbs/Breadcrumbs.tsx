import classNames from 'classnames';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { BreadcrumbPill, PillProps } from '../Pill';

export type Breadcrumb =
  | {
      label: string;
      href: string;
      pillProps?: PillProps;
    }
  | {
      label: string;
    };

export interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
}

export const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  return (
    <div className="flex items-center space-x-1">
      {breadcrumbs.map(({ label, ...breadcrumb }, index) => (
        <Fragment key={label}>
          {index > 0 && <span className="text-gray-500 dark:text-gray-400">·</span>}
          {'href' in breadcrumb ? (
            <Link to={breadcrumb.href}>
              <BreadcrumbPill
                {...breadcrumb.pillProps}
                className={classNames(
                  'min-h-[40px] hover:ring-2',
                  breadcrumb.pillProps?.className,
                )}>
                {label}
              </BreadcrumbPill>
            </Link>
          ) : (
            <span key={label}>{label}</span>
          )}
        </Fragment>
      ))}
    </div>
  );
};
