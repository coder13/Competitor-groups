import classNames from 'classnames';
import { PropsWithChildren } from 'react';

interface ContainerProps extends PropsWithChildren {
  className?: string;
  fullWidth?: boolean;
}

export const Container = ({ children, className, fullWidth = false }: ContainerProps) => {
  return (
    <div
      className={classNames(
        'flex flex-col w-full h-max',
        {
          'max-w-screen-md': !fullWidth,
        },
        className,
      )}>
      {children}
    </div>
  );
};
