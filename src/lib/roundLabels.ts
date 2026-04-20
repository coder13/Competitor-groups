import { Competition, parseActivityCode } from '@wca/helpers';
import { TFunction } from 'i18next';
import { CompatibleRound } from './wcif';

export function getEventRoundsForRound(events: Competition['events'] | undefined, roundId: string) {
  const { eventId } = parseActivityCode(roundId);

  return (
    events
      ?.find((event) => event.id === eventId)
      ?.rounds?.map((candidate) => candidate as CompatibleRound) || []
  );
}

export function activityCodeToRoundName(t: TFunction, roundId: string) {
  const { roundNumber } = parseActivityCode(roundId);

  return t('common.activityCodeToName.round', { roundNumber });
}

export function joinLabels(labels: string[]) {
  if (labels.length <= 1) {
    return labels[0] || '';
  }

  if (labels.length === 2) {
    return `${labels[0]} & ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')}, & ${labels[labels.length - 1]}`;
}
