import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import { Button, ButtonProps } from '../Button';

export interface IconButtonProps extends PropsWithChildren<ButtonProps> {
  ariaLabel: string;
}

export const IconButton = ({ ariaLabel, className, ...props }: IconButtonProps) => {
  return (
    <Button
      aria-label={ariaLabel}
      className={classNames(
        'min-h-10 min-w-10 flex items-center justify-center gap-0 p-0 text-lg leading-none',
        className,
      )}
      {...props}
    />
  );
};
