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
        ' p-2 rounded-md border-b-1 type-meta bg-yellow-100 dark:bg-amber-300 text-gray-800 dark:text-amber-950',
        className,
      )}>
      {prefix && <b>{prefix}: </b>}
      {text}
    </p>
  );
}
