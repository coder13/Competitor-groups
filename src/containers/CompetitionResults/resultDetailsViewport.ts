export const shouldOpenResultDetailsDialog = () =>
  typeof window === 'undefined' ||
  !window.matchMedia ||
  window.matchMedia('(max-width: 767px)').matches;
