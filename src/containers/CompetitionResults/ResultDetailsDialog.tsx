import { EventId, Person, RankingType } from '@wca/helpers';
import { MouseEvent, useId, useLayoutEffect, useRef } from 'react';
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
  returnFocusTo?: HTMLElement | null;
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
  returnFocusTo,
  LinkComponent = AnchorLink,
}: ResultDetailsDialogProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
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

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus =
      returnFocusTo ??
      (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const focusInside = () => (closeButtonRef.current ?? dialog).focus({ preventScroll: true });
    const focusableElements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]',
        ),
      ).filter((element) => {
        const style = window.getComputedStyle(element);
        return (
          element.tabIndex >= 0 &&
          !element.matches(':disabled') &&
          !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
          style.display !== 'none' &&
          style.visibility !== 'hidden'
        );
      });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
      } else if (event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        const controls = focusableElements();
        const index = controls.indexOf(document.activeElement as HTMLElement);
        const nextIndex = event.shiftKey
          ? index <= 0
            ? controls.length - 1
            : index - 1
          : (index + 1) % controls.length;
        (controls[nextIndex] ?? closeButtonRef.current ?? dialog).focus();
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) focusInside();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', containFocus);
    focusInside();

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', containFocus);
      // Wait until removed route elements are detached. Do not steal focus from
      // a new page/dialog, or restore during StrictMode's effect replay.
      queueMicrotask(() => {
        const active = document.activeElement;
        if (
          !dialog.isConnected &&
          previousFocus?.isConnected &&
          (active === document.body || (active instanceof Node && dialog.contains(active)))
        ) {
          previousFocus.focus({ preventScroll: true });
        }
      });
    };
  }, [returnFocusTo]);

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4"
      role="dialog"
      onClick={onClose}>
      <div className="w-full max-w-xl rounded-md bg-panel p-6 shadow-xl" onClick={stopPropagation}>
        <div className="space-y-6">
          <h3 id={titleId} className="type-heading">
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
              ref={closeButtonRef}
              className="px-2 py-2 font-semibold text-primary hover-transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
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
