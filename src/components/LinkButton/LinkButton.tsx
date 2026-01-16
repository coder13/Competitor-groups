import classNames from 'classnames';
import { Link, LinkProps } from 'react-router-dom';

export interface LinkButtonProps {
  to: LinkProps['to'];
  title: string;
  variant?: 'blue' | 'green' | 'gray' | 'light' | 'subtle';
  className?: string;
}

export const LinkButton = ({ to, title, variant = 'blue', className }: LinkButtonProps) => {
  const variantClasses = {
    blue: 'btn-blue',
    green: 'btn-green',
    gray: 'btn-gray',
    light: 'btn-light',
    subtle: 'btn-subtle',
  } satisfies Record<NonNullable<LinkButtonProps['variant']>, string>;

  return (
    <Link
      to={to}
      className={classNames('btn btn-block cursor-pointer', variantClasses[variant], className)}>
      {title}
    </Link>
  );
};
