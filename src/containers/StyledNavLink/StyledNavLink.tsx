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
      classNames(
        `p-2 text-blue-500 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-300 w-full text-center`,
        className,
        {
          'bg-gray-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-lg dark:shadow-gray-800':
            isActive,
        },
      )
    }>
    {text}
  </NavLink>
);
