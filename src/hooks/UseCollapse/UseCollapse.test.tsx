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
