interface CompetitionFactsProps {
  dateRange?: string;
  competitorLimit?: number;
}

export const CompetitionFacts = ({ dateRange, competitorLimit }: CompetitionFactsProps) => {
  const showCompetitorLimit = typeof competitorLimit === 'number' && competitorLimit > 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-gray-300">
      {dateRange && (
        <span className="font-semibold text-slate-900 dark:text-gray-100">{dateRange}</span>
      )}
      {showCompetitorLimit && <span className="type-meta">Limit: {competitorLimit}</span>}
    </div>
  );
};
