import classNames from 'classnames';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  className?: string;
  variant?: 'blue' | 'green' | 'gray' | 'light';
}

export const Button = ({ className, variant = 'blue', ...props }: ButtonProps) => {
  const variantClasses = {
    blue: 'bg-blue-200 hover:bg-blue-300 dark:bg-blue-700 dark:hover:bg-blue-600 text-gray-900 dark:text-white border border-blue-300 dark:border-blue-600',
    green:
      'bg-green-200 hover:bg-green-400 dark:bg-green-700 dark:hover:bg-green-600 text-gray-900 dark:text-white border border-green-300 dark:border-green-600',
    gray: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600',
    light:
      'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600',
  };

  return (
    <button
      className={classNames(
        'px-4 py-2 rounded-md transition-colors',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
};
