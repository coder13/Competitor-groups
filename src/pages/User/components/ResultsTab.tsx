import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WcaCompetitionResult } from '@/lib/api';
import {
  compareUserResultsByNewest,
  formatUserResult,
  getEventResultSummaries,
  getHistoricalPrFlags,
  getPersonResultsPath,
  getRoundTypeName,
  getUserEventName,
} from '../userProfileData';

interface ResultsTabProps {
  results: WcaCompetitionResult[] | undefined;
  isLoading: boolean;
  error: unknown;
  wcaId?: string;
}

function EventIconPicker({
  eventIds,
  selectedEventId,
  onSelect,
}: {
  eventIds: string[];
  selectedEventId: string;
  onSelect: (eventId: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {eventIds.map((eventId) => {
        const isSelected = eventId === selectedEventId;

        return (
          <button
            key={eventId}
            type="button"
            className={classNames(
              'flex h-10 w-10 items-center justify-center rounded-md text-3xl hover-bg-tertiary',
              {
                'bg-tertiary-strong text-default': isSelected,
                'text-muted opacity-50': !isSelected,
              },
            )}
            title={getUserEventName(eventId)}
            onClick={() => onSelect(eventId)}>
            <span className={`cubing-icon event-${eventId}`} aria-hidden="true" />
            <span className="sr-only">{getUserEventName(eventId)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ResultsTab({ results, isLoading, error, wcaId }: ResultsTabProps) {
  const eventSummaries = useMemo(() => getEventResultSummaries(results || []), [results]);
  const eventIds = useMemo(
    () => eventSummaries.map((summary) => summary.eventId),
    [eventSummaries],
  );
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    if (eventIds.length === 0) {
      return;
    }

    if (!selectedEventId || !eventIds.includes(selectedEventId)) {
      setSelectedEventId(eventIds[0]);
    }
  }, [eventIds, selectedEventId]);

  if (isLoading) {
    return <p className="type-body-sm text-muted">Loading results...</p>;
  }

  if (error) {
    return <p className="type-body-sm text-red-600">Unable to load results.</p>;
  }

  if (!results || results.length === 0) {
    return <p className="type-body-sm text-muted">No results available.</p>;
  }

  const selectedEventResults = [...results]
    .filter((result) => result.event_id === selectedEventId)
    .sort(compareUserResultsByNewest);
  const historicalPrFlags = getHistoricalPrFlags(selectedEventResults);
  const selectedEventName = selectedEventId ? getUserEventName(selectedEventId) : '';

  return (
    <div className="space-y-3">
      <EventIconPicker
        eventIds={eventIds}
        selectedEventId={selectedEventId}
        onSelect={setSelectedEventId}
      />

      {selectedEventId && (
        <div className="overflow-x-auto rounded-md border border-tertiary-weak bg-panel shadow-sm">
          <table className="w-full table-auto whitespace-nowrap type-body-sm">
            <thead>
              <tr className="border-b border-tertiary-weak text-left">
                <th className="px-3 py-2 font-semibold">Competition</th>
                <th className="px-3 py-2 font-semibold">Round</th>
                <th className="px-3 py-2 text-right font-semibold">Place</th>
                <th className="px-3 py-2 text-right font-semibold">Single</th>
                <th className="px-3 py-2 text-right font-semibold">Average</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-tertiary-weak bg-tertiary">
                <td className="px-3 py-2 font-semibold" colSpan={5}>
                  <span className={`cubing-icon event-${selectedEventId} mr-2`} />
                  {selectedEventName}
                </td>
              </tr>
              {selectedEventResults.map((result) => {
                const to = getPersonResultsPath(result.competition_id, wcaId);
                const prFlags = historicalPrFlags[result.id];

                return (
                  <tr
                    key={result.id}
                    className="border-b border-tertiary-weak odd:bg-tertiary last:border-b-0">
                    <td className="px-3 py-2">
                      {to ? (
                        <Link className="link-inline" to={to}>
                          {result.competition_id}
                        </Link>
                      ) : (
                        result.competition_id
                      )}
                    </td>
                    <td className="px-3 py-2">{getRoundTypeName(result.round_type_id)}</td>
                    <td className="px-3 py-2 text-right">{result.pos}</td>
                    <td
                      className={classNames('px-3 py-2 text-right font-semibold', {
                        'text-primary': prFlags?.single,
                      })}
                      title={prFlags?.single ? 'Personal record single' : undefined}>
                      {formatUserResult(result.event_id, 'single', result.best)}
                    </td>
                    <td
                      className={classNames('px-3 py-2 text-right', {
                        'font-semibold text-primary': prFlags?.average,
                      })}
                      title={prFlags?.average ? 'Personal record average' : undefined}>
                      {formatUserResult(result.event_id, 'average', result.average)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
