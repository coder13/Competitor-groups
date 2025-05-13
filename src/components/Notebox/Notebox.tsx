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
        'bg-yellow-100 p-2 border-b-1 rounded-md text-gray-800 text-xs',
        className,
      )}>
      {prefix && <b>{prefix}: </b>}
      {text}
    </p>
  );
}
