import classNames from 'classnames';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { LinkRenderer } from '@/lib/linkRenderer';
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
  LinkComponent?: LinkRenderer;
}

export const Breadcrumbs = ({ breadcrumbs, LinkComponent = Link }: BreadcrumbsProps) => {
  return (
    <div className="flex items-center space-x-1">
      {breadcrumbs.map(({ label, ...breadcrumb }, index) => (
        <Fragment key={label}>
          {index > 0 && <span className="text-muted">·</span>}
          {'href' in breadcrumb ? (
            <LinkComponent to={breadcrumb.href}>
              <BreadcrumbPill
                {...breadcrumb.pillProps}
                className={classNames(
                  'min-h-[40px] hover:ring-2',
                  breadcrumb.pillProps?.className,
                )}>
                {label}
              </BreadcrumbPill>
            </LinkComponent>
          ) : (
            <span key={label}>{label}</span>
          )}
        </Fragment>
      ))}
    </div>
  );
};
