import { intlFormatDistance } from 'date-fns';

interface LastFetchAtProps {
  lastFetchedAt: Date;
}

export const LastFetchedAt = ({ lastFetchedAt }: LastFetchAtProps) => {
  return (
    <div className="w-full text-xs text-gray-500 text-right">
      Last fetched {intlFormatDistance(lastFetchedAt, new Date())}
    </div>
  );
};
