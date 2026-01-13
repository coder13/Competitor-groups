import classNames from 'classnames';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export type ButtonVariant = 'blue' | 'green' | 'gray' | 'light';

export interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  className?: string;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  blue: 'btn-blue',
  green: 'btn-green',
  gray: 'btn-gray',
  light: 'btn-light',
};

export const Button = ({ className, variant = 'blue', ...props }: ButtonProps) => {
  return <button className={classNames('btn', variantClasses[variant], className)} {...props} />;
};
