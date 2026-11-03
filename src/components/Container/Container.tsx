import classNames from 'classnames';
import { PropsWithChildren } from 'react';

interface ContainerProps extends PropsWithChildren {
  className?: string;
  fullWidth?: boolean;
  scrollRestorationId?: string;
}

export const Container = ({
  children,
  className,
  fullWidth = false,
  scrollRestorationId,
}: ContainerProps) => {
  return (
    <div
      data-scroll-restoration={scrollRestorationId}
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
