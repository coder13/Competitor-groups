import classNames from 'classnames';

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={classNames(
        'flex align-center justify-between w-full bg-blue-200 px-4 py-2 rounded hover:opacity-80',
        className,
      )}>
      {children}
      <i className="m-0 fa fa-solid fa-arrow-up-right-from-square" />
    </a>
  );
}
