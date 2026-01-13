import classNames from 'classnames';
import { NavLink, NavLinkProps } from 'react-router-dom';

export interface StyledNavLinkProps extends NavLinkProps {
  to: string;
  text: string;
  className?: string;
}

export const StyledNavLink: React.FC<StyledNavLinkProps> = ({
  to,
  text,
  className,
  ...props
}: StyledNavLinkProps) => (
  <NavLink
    {...props}
    end
    to={to}
    className={({ isActive }) =>
      classNames('link-nav', className, {
        'bg-tertiary-strong text-blue-700 dark:text-blue-300 shadow-lg shadow-tertiary-dark':
          isActive,
      })
    }>
    {text}
  </NavLink>
);
