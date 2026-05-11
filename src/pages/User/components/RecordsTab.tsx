import { events } from '@/lib/events';
import {
  formatUserResult,
  getUserEventName,
  WcaPersonalRecords,
  WcaPersonalRecord,
} from '../userProfileData';

interface RecordsTabProps {
  records: WcaPersonalRecords | undefined;
  isLoading: boolean;
  error: unknown;
}

type RankingType = 'single' | 'average';

const eventOrder = new Map<string, number>(events.map((event, index) => [event.id, index]));

const rankValue = (rank: number | undefined) => (rank ? rank.toLocaleString() : '-');

const resultValue = (
  eventId: string,
  rankingType: RankingType,
  record: WcaPersonalRecord | undefined,
) => formatUserResult(eventId, rankingType, record?.best);

export function RecordsTab({ records, isLoading, error }: RecordsTabProps) {
  if (isLoading) {
    return <p className="type-body-sm text-muted">Loading records...</p>;
  }

  if (error) {
    return <p className="type-body-sm text-red-600">Unable to load records.</p>;
  }

  const entries = Object.entries(records || {}).sort(([a], [b]) => {
    const eventOrderDifference =
      (eventOrder.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (eventOrder.get(b) ?? Number.MAX_SAFE_INTEGER);

    return eventOrderDifference || getUserEventName(a).localeCompare(getUserEventName(b));
  });

  if (entries.length === 0) {
    return <p className="type-body-sm text-muted">No records available.</p>;
  }

  return (
    <div>
      <div className="hidden overflow-hidden rounded-md border border-tertiary-weak bg-panel shadow-sm md:block">
        <table className="w-full table-auto whitespace-nowrap type-body-sm">
          <thead>
            <tr className="border-b border-tertiary-weak text-left">
              <th className="px-3 py-2 font-semibold">Event</th>
              <th className="px-3 py-2 text-right font-semibold">Single</th>
              <th className="px-3 py-2 text-right font-semibold text-muted">NR</th>
              <th className="px-3 py-2 text-right font-semibold text-muted">CR</th>
              <th className="px-3 py-2 text-right font-semibold text-muted">WR</th>
              <th className="px-3 py-2 text-right font-semibold">Average</th>
              <th className="px-3 py-2 text-right font-semibold text-muted">WR</th>
              <th className="px-3 py-2 text-right font-semibold text-muted">CR</th>
              <th className="px-3 py-2 text-right font-semibold text-muted">NR</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([eventId, record]) => (
              <tr
                key={eventId}
                className="border-b border-tertiary-weak odd:bg-tertiary last:border-b-0">
                <td className="px-3 py-2 font-medium">
                  <span className={`cubing-icon event-${eventId} mr-2`} aria-hidden="true" />
                  {getUserEventName(eventId)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {resultValue(eventId, 'single', record.single)}
                </td>
                <td className="px-3 py-2 text-right text-muted">
                  {rankValue(record.single?.country_rank)}
                </td>
                <td className="px-3 py-2 text-right text-muted">
                  {rankValue(record.single?.continent_rank)}
                </td>
                <td className="px-3 py-2 text-right text-muted">
                  {rankValue(record.single?.world_rank)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {resultValue(eventId, 'average', record.average)}
                </td>
                <td className="px-3 py-2 text-right text-muted">
                  {rankValue(record.average?.world_rank)}
                </td>
                <td className="px-3 py-2 text-right text-muted">
                  {rankValue(record.average?.continent_rank)}
                </td>
                <td className="px-3 py-2 text-right text-muted">
                  {rankValue(record.average?.country_rank)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {entries.map(([eventId, record]) => (
          <div
            key={eventId}
            className="rounded-md border border-tertiary-weak bg-panel px-3 py-2 shadow-sm">
            <div className="space-y-2">
              <div className="type-label text-default">
                <span className={`cubing-icon event-${eventId} mr-2`} aria-hidden="true" />
                {getUserEventName(eventId)}
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 type-body-sm">
                <div className="font-semibold text-muted">Single</div>
                <div className="min-w-0">
                  <div className="font-semibold text-default">
                    {resultValue(eventId, 'single', record.single)}
                  </div>
                  <div className="text-muted">
                    NR {rankValue(record.single?.country_rank)} / CR{' '}
                    {rankValue(record.single?.continent_rank)} / WR{' '}
                    {rankValue(record.single?.world_rank)}
                  </div>
                </div>

                <div className="font-semibold text-muted">Average</div>
                <div className="min-w-0">
                  <div className="font-semibold text-default">
                    {resultValue(eventId, 'average', record.average)}
                  </div>
                  <div className="text-muted">
                    NR {rankValue(record.average?.country_rank)} / CR{' '}
                    {rankValue(record.average?.continent_rank)} / WR{' '}
                    {rankValue(record.average?.world_rank)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
