import classNames from 'classnames';
import { Link, LinkProps } from 'react-router-dom';

export interface LinkButtonProps {
  to: LinkProps['to'];
  title: string;
  variant?: 'blue' | 'green' | 'gray' | 'light';
  className?: string;
}

export const LinkButton = ({ to, title, variant = 'blue', className }: LinkButtonProps) => {
  const variantClasses = {
    blue: 'bg-blue-200 hover:bg-blue-300 dark:bg-blue-800 dark:hover:bg-blue-600 text-gray-900 dark:text-white border-blue-300 dark:border-blue-600',
    green:
      'bg-green-200 hover:bg-green-300 dark:bg-green-700 dark:hover:bg-green-600 text-gray-900 dark:text-white border-green-300 dark:border-green-600',
    gray: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600',
    light:
      'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600',
  };

  return (
    <Link
      to={to}
      className={classNames(
        'px-4 py-2 shadow-sm rounded-md w-full border p-2 cursor-pointer transition-colors duration-150 min-h-[40px]',
        variantClasses[variant],
        className,
      )}>
      {title}
    </Link>
  );
};
