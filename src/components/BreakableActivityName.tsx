import { activityCodeToName } from '@wca/helpers';
import classNames from 'classnames';

interface BreakableActivityNameProps {
  className?: string;
  activityCode: string;
}

export const BreakableActivityName = ({
  className = '',
  activityCode,
}: BreakableActivityNameProps) => {
  const name = activityCodeToName(activityCode);
  const [event, round] = name.split(',').map((s) => s.trim());

  return (
    <div className={classNames('flex flex-wrap w-28 sm:w-64', className)}>
      <span className="whitespace-nowrap">{event}</span>
      <span className="mr-1 hidden sm:inline-block">{', '}</span>
      <span>{round}</span>
    </div>
  );
};
