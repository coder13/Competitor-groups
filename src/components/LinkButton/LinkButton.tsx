import classNames from 'classnames';
import { Link, LinkProps } from 'react-router-dom';
import { LinkRenderer } from '@/lib/linkRenderer';

export interface LinkButtonProps {
  to: LinkProps['to'];
  title: string;
  variant?: 'blue' | 'green' | 'gray' | 'light';
  className?: string;
  LinkComponent?: LinkRenderer;
}

export const LinkButton = ({
  to,
  title,
  variant = 'blue',
  className,
  LinkComponent = Link,
}: LinkButtonProps) => {
  const variantClasses = {
    blue: 'btn-blue',
    green: 'btn-green',
    gray: 'btn-gray',
    light: 'btn-light',
  } satisfies Record<NonNullable<LinkButtonProps['variant']>, string>;

  return (
    <LinkComponent
      to={to}
      className={classNames('btn btn-block cursor-pointer', variantClasses[variant], className)}>
      {title}
    </LinkComponent>
  );
};
