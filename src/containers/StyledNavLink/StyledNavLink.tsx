import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

export const StyledNavLink = ({ to, text }: { to: string; text: string }) => (
  <NavLink
    end
    to={to}
    className={({ isActive }) =>
      classNames(`p-2 text-blue-500 hover:bg-gray-50 hover:text-blue-700 w-full text-center`, {
        'bg-gray-100 text-blue-700 shadow-lg': isActive,
      })
    }>
    {text}
  </NavLink>
);
