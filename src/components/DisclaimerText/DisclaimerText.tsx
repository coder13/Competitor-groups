import { NoteBox } from '../Notebox';

export function DisclaimerText({ className }: { className?: string }) {
  return (
    <NoteBox
      className={className}
      text="Start times are subject to change and may run ahead or behind schedule. Check with competition organizers for updates."
    />
  );
}
