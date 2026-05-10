import { EventId, Person, RankingType } from '@wca/helpers';
import { MouseEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { renderResultByEventId } from '@/lib/results';
import type { CompetitionRoundResult } from './CompetitionResultsTable';

interface ResultDetailsDialogItem {
  label: string;
  value?: string;
  link?: {
    label: string;
    to: string;
  };
}

interface ResultDetailsDialogProps {
  competitionId: string;
  eventId: string;
  name: string;
  title?: string;
  details?: ResultDetailsDialogItem[];
  person?: Person;
  primaryRankingType: RankingType;
  result: CompetitionRoundResult;
  onClose: () => void;
  LinkComponent?: LinkRenderer;
}

const renderValue = (eventId: string, rankingType: RankingType, value: number) => {
  if (value === 0) {
    return '';
  }

  return renderResultByEventId(eventId as EventId, rankingType, value);
};

export function ResultDetailsDialog({
  competitionId,
  eventId,
  name,
  title,
  details,
  person,
  primaryRankingType,
  result,
  onClose,
  LinkComponent = AnchorLink,
}: ResultDetailsDialogProps) {
  const { t } = useTranslation();
  const attempts = result.attempts
    .map((attempt) => renderValue(eventId, 'single', attempt.result))
    .filter(Boolean);
  const best = renderValue(eventId, 'single', result.best);
  const average = renderValue(eventId, primaryRankingType, result.average);
  const defaultDetails: ResultDetailsDialogItem[] = [
    {
      label: t('common.name'),
      value: name,
      link: person
        ? {
            label: t('competition.results.allResults'),
            to: `/competitions/${competitionId}/persons/${person.registrantId}/results`,
          }
        : undefined,
    },
  ];
  const displayedDetails = details ?? defaultDetails;
  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4"
      role="dialog"
      onClick={onClose}>
      <div className="w-full max-w-xl rounded-md bg-panel p-6 shadow-xl" onClick={stopPropagation}>
        <div className="space-y-6">
          <h3 className="type-heading">
            {title ?? `${name}${result.ranking ? ` #${result.ranking}` : ''}`}
          </h3>

          <dl className="space-y-4">
            {displayedDetails.map((detail) => (
              <div key={detail.label}>
                <dt className="font-semibold">{detail.label}</dt>
                {detail.value && <dd>{detail.value}</dd>}
                {detail.link && (
                  <dd>
                    <LinkComponent
                      to={detail.link.to}
                      className="text-primary hover-transition hover:underline">
                      {detail.link.label}
                    </LinkComponent>
                  </dd>
                )}
              </div>
            ))}

            {attempts.length > 0 && (
              <div>
                <dt className="font-semibold">{t('competition.results.attempts')}</dt>
                <dd>{attempts.join(', ')}</dd>
              </div>
            )}

            {best && (
              <div>
                <dt className="font-semibold">{t('competition.results.best')}</dt>
                <dd>{best}</dd>
              </div>
            )}

            {average && (
              <div>
                <dt className="font-semibold">{t('competition.results.average')}</dt>
                <dd>{average}</dd>
              </div>
            )}
          </dl>

          <div className="flex justify-end">
            <button
              className="px-2 py-1 font-semibold text-primary hover-transition hover:underline"
              type="button"
              onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
