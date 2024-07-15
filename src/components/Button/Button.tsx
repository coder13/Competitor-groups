import classNames from 'classnames';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  className?: string;
}

export const Button = ({ className, ...props }: ButtonProps) => {
  return (
    <button
      className={classNames('px-4 py-2 rounded-md bg-blue-500 text-white', className)}
      {...props}
    />
  );
};
