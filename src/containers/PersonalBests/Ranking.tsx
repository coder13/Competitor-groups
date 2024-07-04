import classNames from 'classnames';

export const Ranking = ({ ranking }: { ranking: number }) => (
  <span
    className={classNames({
      'text-orange-500': ranking === 1,
    })}>
    {new Intl.NumberFormat([...navigator.languages]).format(ranking) || '-'}
  </span>
);
