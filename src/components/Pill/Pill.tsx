import classNames from 'classnames';

export type PillProps = React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>;

export const Pill = ({ className, ...props }: PillProps) => {
  return (
    <span
      className={classNames(
        `inline-flex justify-center items-center px-1.5 py-1 ring-1 ring-inset ring-tertiary-weak font-medium rounded-md bg-tertiary text-tertiary shadow-sm`,
        className,
      )}
      {...props}
    />
  );
};

export const BreadcrumbPill = ({ className, ...props }: PillProps) => {
  return (
    <span
      className={classNames(
        `inline-flex justify-center items-center px-1.5 py-1 ring-1 ring-inset rounded-md shadow-sm ring-tertiary-weak bg-tertiary text-tertiary shadow-tertiary-dark`,
        className,
      )}
      {...props}
    />
  );
};

export const BaseAssignmentPill = ({ className, ...props }: PillProps) => {
  return (
    <span
      className={classNames(
        `inline-flex justify-center items-center px-2 py-1 ring-1 ring-inset font-medium rounded-md shadow-sm ring-tertiary-weak shadow-tertiary-dark`,
        className,
      )}
      {...props}
    />
  );
};

export const RoomPill = ({ className, ...props }: PillProps) => {
  return (
    <span
      className={classNames(
        `inline-flex justify-center items-center px-2 py-1 ring-1 ring-inset font-medium rounded-md bg-tertiary text-tertiary shadow-sm ring-tertiary-weak shadow-tertiary-dark`,
        className,
      )}
      {...props}
    />
  );
};
