import { PinCompetitionButton } from '@/components/PinCompetitionButton';
import { CompetitionSummary } from './CompetitionSummary';

interface CompetitionHomeHeaderProps {
  competitionId: string;
  startDate?: string;
  numberOfDays?: number;
  venueName?: string;
}

export const CompetitionHomeHeader = ({
  competitionId,
  startDate,
  numberOfDays,
  venueName,
}: CompetitionHomeHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <CompetitionSummary startDate={startDate} numberOfDays={numberOfDays} venueName={venueName} />
      <PinCompetitionButton competitionId={competitionId} />
    </div>
  );
};
