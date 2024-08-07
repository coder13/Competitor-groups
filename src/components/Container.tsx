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
          'lg:w-1/2 md:w-2/3': !fullWidth,
        },
        className
      )}>
      {children}
    </div>
  );
};
