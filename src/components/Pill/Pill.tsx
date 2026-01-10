import classNames from 'classnames';

export type PillProps = React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>;

export const Pill = ({ className, ...props }: PillProps) => {
  return (
    <span
      className={classNames(
        `inline-flex justify-center items-center px-1.5 py-1 ring-1 ring-inset ring-gray-100 font-medium rounded-md bg-gray-100 text-gray-800 shadow-sm`,
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
        `inline-flex justify-center items-center px-1.5 py-1 ring-1 ring-inset rounded-md shadow-sm dark:ring-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:shadow-gray-800`,
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
        `inline-flex justify-center items-center px-2 py-1 ring-1 ring-inset font-medium rounded-md shadow-sm dark:ring-gray-600 dark:shadow-gray-800`,
        className,
      )}
      {...props}
    />
  );
};
