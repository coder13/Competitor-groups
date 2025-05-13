import classNames from 'classnames';
import { Link, LinkProps } from 'react-router-dom';

export interface LinkButtonProps {
  to: LinkProps['to'];
  title: string;
  color: 'blue' | 'green';
  className?: string;
}

export const LinkButton = ({ to, title, color, className }: LinkButtonProps) => {
  return (
    <Link
      to={to}
      className={classNames(
        'px-4 py-2 shadow-sm rounded-md w-full border p-2 cursor-pointer transition-colors duration-150 min-h-[40px]',
        {
          'bg-blue-200 hover:bg-blue-300': color === 'blue',
          'bg-green-200 hover:bg-green-300': color === 'green',
        },
        className,
      )}>
      {title}
    </Link>
  );
};
