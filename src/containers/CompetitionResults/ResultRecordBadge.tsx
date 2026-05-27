export type ResultRecordTag = string | null | undefined;

interface ResultRecordBadgeProps {
  tag: ResultRecordTag;
}

export const normalizeResultRecordTag = (tag: ResultRecordTag) => tag?.toUpperCase();

export function ResultRecordBadge({ tag }: ResultRecordBadgeProps) {
  const normalizedTag = normalizeResultRecordTag(tag);

  if (!normalizedTag) {
    return null;
  }

  return (
    <span
      aria-label={`${normalizedTag} record`}
      className="relative -top-1 inline-flex shrink-0 rounded-sm bg-gray-100 px-0.5 text-[0.55rem] font-bold leading-none text-gray-950 ring-1 ring-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-500">
      {normalizedTag}
    </span>
  );
}
