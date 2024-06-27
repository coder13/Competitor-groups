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
  result: AttemptResult
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

  return `${formatCentiseconds(cutoff.attemptResult).replace(/\.00+$/, '')}`;
};

export const renderCentiseconds = (centiseconds: number) => {
  if (centiseconds >= 60000) {
    const hours = Math.floor(centiseconds / 360000);
    const centi = formatCentiseconds(centiseconds - hours * 360000).replace(/\.00+$/, '');
    return hours ? `${hours}:${centi}` : centi;
  }

  return formatCentiseconds(centiseconds).replace(/\.00+$/, '');
};
