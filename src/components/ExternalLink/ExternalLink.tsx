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
      className={classNames('link-external', className)}>
      {children}
      <i className="m-0 fa fa-solid fa-arrow-up-right-from-square" />
    </a>
  );
}
