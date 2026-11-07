import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Competition } from '@wca/helpers';
import { getScheduledDays } from '@/lib/activities';
import { ScheduleContainer } from './Schedule';

jest.mock('@/lib/activities', () => ({
  getScheduledDays: jest.fn(() => [
    { date: 'Saturday, 1/1/2030', activities: [{ id: 1, endTime: '2030-01-01T12:00:00Z' }] },
  ]),
  hasMultipleScheduleLocations: () => false,
}));
jest.mock('./scheduleActivityGroups', () => ({ getScheduleActivityGroups: () => [{ id: '1' }] }));
jest.mock('./ScheduleActivityRow', () => ({
  ScheduleActivityRow: () => <div>Day activities</div>,
}));
const wcif = { id: 'One2026' } as Competition;
beforeEach(() => {
  localStorage.clear();
  jest
    .mocked(getScheduledDays)
    .mockReset()
    .mockReturnValue([
      { date: 'Saturday, 1/1/2030', activities: [{ id: 1, endTime: '2030-01-01T12:00:00Z' }] },
    ] as ReturnType<typeof getScheduledDays>);
});

it('toggles with Enter and Space, preserves focus, and exposes the controlled day', async () => {
  render(<ScheduleContainer wcif={wcif} />);
  const toggle = screen.getByRole('button', { name: 'Saturday, 1/1/2030' });
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(document.getElementById(toggle.getAttribute('aria-controls')!)).toContainElement(
    screen.getByText('Day activities'),
  );
  await act(() => userEvent.tab());
  expect(toggle).toHaveFocus();
  await act(() => userEvent.keyboard('{Enter}'));
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('Day activities')).not.toBeInTheDocument();
  expect(toggle).toHaveFocus();
  await act(() => userEvent.keyboard(' '));
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Day activities')).toBeInTheDocument();
  expect(toggle).toHaveFocus();
});

it('restores a saved collapse state without carrying it into another competition on the same date', async () => {
  const { rerender } = render(<ScheduleContainer wcif={wcif} />);
  await act(() => userEvent.click(screen.getByText('Saturday, 1/1/2030')));
  expect(screen.queryByText('Day activities')).not.toBeInTheDocument();
  rerender(<ScheduleContainer wcif={{ ...wcif, id: 'Other2026' }} />);
  expect(screen.getByText('Day activities')).toBeInTheDocument();
  rerender(<ScheduleContainer wcif={wcif} />);
  expect(screen.queryByText('Day activities')).not.toBeInTheDocument();
});

it('persists toggles for multiple days rather than overwriting the previous day', async () => {
  const mockDays = jest.mocked(getScheduledDays);
  const days = mockDays(wcif);
  mockDays.mockReturnValueOnce([...days, { ...days[0], date: 'Sunday, 1/2/2030' }]);
  const { unmount } = render(<ScheduleContainer wcif={wcif} />);
  await act(() => userEvent.click(screen.getByText('Saturday, 1/1/2030')));
  await act(() => userEvent.click(screen.getByText('Sunday, 1/2/2030')));
  const saved = JSON.parse(localStorage.getItem('collapse')!) as Record<string, string[]>;
  expect(saved['One2026-schedule']).toEqual(['Saturday, 1/1/2030', 'Sunday, 1/2/2030']);
  unmount();
  mockDays.mockReturnValueOnce([...days, { ...days[0], date: 'Sunday, 1/2/2030' }]);
  render(<ScheduleContainer wcif={wcif} />);
  expect(screen.getAllByRole('button')).toHaveLength(2);
  screen
    .getAllByRole('button')
    .forEach((button) => expect(button).toHaveAttribute('aria-expanded', 'false'));
});

it('automatically collapses past days, lets the user reopen them, and keeps later days expanded', async () => {
  const mockDays = jest.mocked(getScheduledDays);
  const days = mockDays(wcif);
  mockDays.mockReturnValueOnce([
    {
      ...days[0],
      date: 'Past day',
      activities: [{ ...days[0].activities[0], endTime: '2020-01-01T12:00:00Z' }],
    },
    { ...days[0], date: 'Future day' },
  ]);
  try {
    render(<ScheduleContainer wcif={wcif} />);
    const pastDay = screen.getByRole('button', { name: 'Past day' });
    expect(pastDay).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Future day' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await act(() => userEvent.click(pastDay));
    expect(pastDay).toHaveAttribute('aria-expanded', 'true');
    expect(pastDay).toHaveFocus();
  } finally {
    jest.restoreAllMocks();
  }
});

const historicalDays = ['Saturday', 'Sunday'].map((date, index) => ({
  date,
  activities: [{ id: index + 1, endTime: '2020-01-01T12:00:00Z' }],
})) as ReturnType<typeof getScheduledDays>;

it.each([[[]], [['Saturday']], [['Sunday']]])(
  'gives saved historical day choices %j precedence over automatic collapse',
  (collapsed) => {
    jest.mocked(getScheduledDays).mockReturnValue(historicalDays);
    localStorage.setItem(
      'collapse',
      JSON.stringify({ 'One2026-schedule': collapsed, other: ['Unrelated'] }),
    );
    render(<ScheduleContainer wcif={wcif} />);
    for (const { date } of historicalDays) {
      expect(screen.getByRole('button', { name: date })).toHaveAttribute(
        'aria-expanded',
        String(!collapsed.includes(date)),
      );
    }
    expect(JSON.parse(localStorage.getItem('collapse')!)).toEqual({
      'One2026-schedule': collapsed,
      other: ['Unrelated'],
    });
  },
);

it.each([false, true])(
  'retains historical keyboard choices across reload (mixed: %s)',
  async (mixed) => {
    jest.mocked(getScheduledDays).mockReturnValue(historicalDays);
    localStorage.setItem('collapse', JSON.stringify({ other: ['Unrelated'] }));
    const { unmount } = render(<ScheduleContainer wcif={wcif} />);
    const saturday = screen.getByRole('button', { name: 'Saturday' });
    const sunday = screen.getByRole('button', { name: 'Sunday' });
    expect(saturday).toHaveAttribute('aria-expanded', 'false');
    expect(sunday).toHaveAttribute('aria-expanded', 'false');
    await act(() => userEvent.tab());
    await act(() => userEvent.keyboard('{Enter}'));
    await act(() => userEvent.tab());
    await act(() => userEvent.keyboard(' '));
    if (mixed) {
      await act(() => userEvent.tab({ shift: true }));
      await act(() => userEvent.keyboard('{Enter}'));
    }
    expect(saturday).toHaveAttribute('aria-expanded', String(!mixed));
    expect(sunday).toHaveAttribute('aria-expanded', 'true');
    unmount();
    const { rerender } = render(<ScheduleContainer wcif={wcif} />);
    expect(screen.getByRole('button', { name: 'Saturday' })).toHaveAttribute(
      'aria-expanded',
      String(!mixed),
    );
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute('aria-expanded', 'true');
    // Receiving refreshed schedule data must not reset an explicit choice either.
    rerender(<ScheduleContainer wcif={{ ...wcif }} />);
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute('aria-expanded', 'true');
    rerender(<ScheduleContainer wcif={{ ...wcif, id: 'Other2026' }} />);
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    rerender(<ScheduleContainer wcif={wcif} />);
    expect(screen.getByRole('button', { name: 'Saturday' })).toHaveAttribute(
      'aria-expanded',
      String(!mixed),
    );
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute('aria-expanded', 'true');
    expect(JSON.parse(localStorage.getItem('collapse')!)).toEqual({
      other: ['Unrelated'],
      'One2026-schedule': mixed ? ['Saturday'] : [],
    });
  },
);
