import {
  EventId,
  RankingType,
  AttemptResult,
  formatMultiResult,
  decodeMultiResult,
  formatCentiseconds,
  Cutoff,
} from '@wca/helpers';

export const renderResultByEventId = (
  eventId: EventId,
  rankingType: RankingType,
  result: AttemptResult,
) => {
  if (eventId === '333fm') {
    return rankingType === 'average' ? ((result as number) / 100).toFixed(2).toString() : result;
  }

  if (eventId === '333mbf') {
    return formatMultiResult(decodeMultiResult(result));
  }

  return formatCentiseconds(result as number);
};

export const renderCutoff = (cutoff: Cutoff) => {
  if (cutoff.numberOfAttempts === 0) {
    return '-';
  }

  return `${formatCentiseconds(cutoff.attemptResult)}`;
};

export const renderCentiseconds = (centiseconds: number) => {
  if (centiseconds >= 360000) {
    const hours = Math.floor(centiseconds / 360000);
    const minutes = Math.floor((centiseconds % 360000) / 6000);
    const seconds = Math.floor((centiseconds % 6000) / 100);
    const centis = centiseconds % 100;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  }

  return formatCentiseconds(centiseconds);
};
