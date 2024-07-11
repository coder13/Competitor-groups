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
        'w-full border rounded-md p-2 px-1 cursor-pointer transition-colors duration-150 my-1 min-h-[40px]',
        {
          'bg-blue-200 hover:bg-blue-300': color === 'blue',
          'bg-green-200 hover:bg-green-300': color === 'green',
        },
        className
      )}>
      {title}
    </Link>
  );
};
