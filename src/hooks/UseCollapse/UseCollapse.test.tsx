import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { useCollapse } from './UseCollapse';

beforeEach(() => localStorage.clear());

it('handles repeated toggles without render-phase storage writes or losing other saved schedules', () => {
  localStorage.setItem('collapse', JSON.stringify({ other: ['Other date'] }));
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const { result } = renderHook(() => useCollapse('schedule'), { wrapper: StrictMode });
    act(() => {
      result.current.toggleDate('Saturday');
      result.current.toggleDate('Sunday');
      result.current.toggleDate('Saturday');
    });
    expect(result.current.collapsedDates).toEqual(['Sunday']);
    expect(JSON.parse(localStorage.getItem('collapse')!)).toEqual({
      other: ['Other date'],
      schedule: ['Sunday'],
    });
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});

it.each([[[]], [['Sunday']]])(
  'initializes from explicit saved dates %j without evaluating defaults',
  (savedDates) => {
    localStorage.setItem('collapse', JSON.stringify({ schedule: savedDates }));
    const defaults = jest.fn(() => ['Saturday', 'Sunday']);
    const { result } = renderHook(() => useCollapse('schedule', defaults));
    expect(result.current.collapsedDates).toEqual(savedDates);
    expect(defaults).not.toHaveBeenCalled();
  },
);

it('uses defaults only for an unsaved schedule and preserves rapid choices through remount', () => {
  localStorage.setItem('collapse', JSON.stringify({ other: ['Unrelated'] }));
  const defaults = jest.fn(() => ['Saturday', 'Sunday']);
  const { result, rerender, unmount } = renderHook(() => useCollapse('schedule', defaults));
  expect(result.current.collapsedDates).toEqual(['Saturday', 'Sunday']);
  expect(defaults).toHaveBeenCalledTimes(1);
  expect(JSON.parse(localStorage.getItem('collapse')!)).toEqual({ other: ['Unrelated'] });
  act(() => {
    result.current.toggleDate('Saturday');
    result.current.toggleDate('Sunday');
    result.current.toggleDate('Saturday');
  });
  expect(result.current.collapsedDates).toEqual(['Saturday']);
  rerender();
  expect(defaults).toHaveBeenCalledTimes(1);
  unmount();
  const remounted = renderHook(() => useCollapse('schedule', defaults));
  expect(remounted.result.current.collapsedDates).toEqual(['Saturday']);
  expect(defaults).toHaveBeenCalledTimes(1);
  expect(JSON.parse(localStorage.getItem('collapse')!)).toEqual({
    other: ['Unrelated'],
    schedule: ['Saturday'],
  });
});
