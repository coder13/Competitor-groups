import { Link } from 'react-router-dom';
import { WcaPersonCompetition } from '@/lib/api';
import { getPersonResultsPath } from '../userProfileData';

interface CompetitionsTabProps {
  competitions: ApiCompetition[];
  assignmentStatus: Record<string, boolean> | undefined;
  isCheckingAssignments: boolean;
  pastCompetitions: WcaPersonCompetition[] | undefined;
  isLoadingPastCompetitions: boolean;
  wcaId?: string;
}

const formatCompetitionDates = (competition: Pick<ApiCompetition, 'start_date' | 'end_date'>) => {
  const start = new Date(`${competition.start_date}T00:00:00`);
  const end = new Date(`${competition.end_date}T00:00:00`);

  if (competition.start_date === competition.end_date) {
    return start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return `${start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} - ${end.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
};

export function CompetitionsTab({
  competitions,
  assignmentStatus,
  isCheckingAssignments,
  pastCompetitions,
  isLoadingPastCompetitions,
  wcaId,
}: CompetitionsTabProps) {
  const visibleCompetitionIds = new Set(competitions.map((competition) => competition.id));
  const sortedPastCompetitions = [...(pastCompetitions || [])]
    .filter((competition) => !visibleCompetitionIds.has(competition.id))
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h2 className="type-label text-default">Upcoming competitions</h2>
        {competitions.length === 0 ? (
          <p className="type-body-sm text-muted">No upcoming competitions.</p>
        ) : (
          competitions.map((competition) => {
            const hasAssignments = assignmentStatus?.[competition.id];
            const statusText =
              hasAssignments == null && isCheckingAssignments
                ? 'Checking assignments'
                : hasAssignments
                  ? 'Assignments generated'
                  : 'No assignments yet';

            return (
              <Link
                key={competition.id}
                to={`/competitions/${competition.id}`}
                className="block rounded-md border border-tertiary-weak bg-panel px-3 py-2 shadow-sm hover-bg-tertiary">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="type-label text-default">{competition.name}</div>
                    <div className="type-body-sm text-subtle">
                      {competition.city}, {competition.country_iso2} -{' '}
                      {formatCompetitionDates(competition)}
                    </div>
                  </div>
                  <span
                    className={
                      hasAssignments
                        ? 'shrink-0 text-right type-body-sm text-green-600'
                        : 'shrink-0 text-right type-body-sm text-muted'
                    }>
                    {statusText}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </section>

      <section className="space-y-2">
        <h2 className="type-label text-default">Past competitions</h2>
        {isLoadingPastCompetitions ? (
          <p className="type-body-sm text-muted">Loading past competitions...</p>
        ) : sortedPastCompetitions.length === 0 ? (
          <p className="type-body-sm text-muted">No past competitions.</p>
        ) : (
          sortedPastCompetitions.map((competition) => {
            const to = getPersonResultsPath(competition.id, wcaId);
            const content = (
              <div className="min-w-0 space-y-1">
                <div className="type-label text-default">{competition.name}</div>
                <div className="type-body-sm text-subtle">
                  {formatCompetitionDates(competition)}
                </div>
              </div>
            );

            if (!to) {
              return (
                <div
                  key={competition.id}
                  className="rounded-md border border-tertiary-weak bg-panel px-3 py-2 shadow-sm">
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={competition.id}
                to={to}
                className="block rounded-md border border-tertiary-weak bg-panel px-3 py-2 shadow-sm hover-bg-tertiary">
                {content}
              </Link>
            );
          })
        )}
      </section>
    </div>
  );
}
