export default function NoteBox({ text, prefix = 'Note' }: { text: string; prefix?: string }) {
  return (
    <>
      <p className="bg-yellow-100 p-2 border-b-1 rounded-md text-gray-800 text-xs">
        {prefix && <b>{prefix}: </b>}
        {text}
      </p>
    </>
  );
}
