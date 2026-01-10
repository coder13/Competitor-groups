import classNames from 'classnames';

interface NoteBoxProps {
  text: string;
  prefix?: string;
  className?: string;
}

export function NoteBox({ text, prefix = 'Note', className }: NoteBoxProps) {
  return (
    <p
      className={classNames(
        ' p-2 rounded-md border-b-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-gray-800 dark:text-white',
        className,
      )}>
      {prefix && <b>{prefix}: </b>}
      {text}
    </p>
  );
}
