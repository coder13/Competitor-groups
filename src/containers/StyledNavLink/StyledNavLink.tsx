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
        `p-2 text-blue-500 hover:bg-gray-50 hover:text-blue-700 w-full text-center`,
        className,
        {
          'bg-gray-100 text-blue-700 shadow-lg': isActive,
        },
      )
    }>
    {text}
  </NavLink>
);
