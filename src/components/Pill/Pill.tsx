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
