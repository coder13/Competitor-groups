import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Person } from '@wca/helpers';
import { PersonalScheduleContent } from './PersonalSchedule';
import { getGroupedAssignmentsByDate } from './utils';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/components', () => ({ DisclaimerText: () => null }));
jest.mock('@/providers/WCIFProvider', () => ({ useWCIF: () => ({ wcif: { id: 'Test' } }) }));
jest.mock('@/hooks/useNow/useNow', () => ({ useNow: () => 0 }));
jest.mock('@/lib/events', () => ({ isOfficialEventId: jest.fn() }));
jest.mock('@/lib/activityCodes', () => ({ parseActivityCodeFlexible: jest.fn() }));
jest.mock('@/lib/activities', () => ({ hasMultipleScheduleLocations: () => false }));
jest.mock('./utils', () => ({
  getGroupedAssignmentsByDate: jest.fn(() => [
    { date: 'Saturday', dateParts: [], assignments: [] },
    { date: 'Sunday', dateParts: [], assignments: [] },
  ]),
}));
jest.mock('./PersonalExtraAssignment', () => ({ ExtraAssignment: () => null }));
jest.mock('./PersonalNormalAssignment', () => ({ PersonalNormalAssignment: () => null }));
jest.mock('./PersonalPageLayout', () => ({ PersonalPageLayout: () => null }));

const person = { registrantId: 1, assignments: [{ activityId: 1 }] } as Person;
beforeEach(() => {
  localStorage.clear();
  jest
    .mocked(getGroupedAssignmentsByDate)
    .mockReset()
    .mockReturnValue([
      { date: 'Saturday', dateParts: [], assignments: [] },
      { date: 'Sunday', dateParts: [], assignments: [] },
    ] as unknown as ReturnType<typeof getGroupedAssignmentsByDate>);
});

it('makes personal schedule days operable by keyboard with a stable focused button', async () => {
  render(<PersonalScheduleContent person={person} />);
  const saturday = screen.getByRole('button', { name: 'Saturday' });
  expect(saturday).toHaveAttribute('aria-expanded', 'true');
  await act(() => userEvent.tab());
  expect(saturday).toHaveFocus();
  await act(() => userEvent.keyboard('{Enter}'));
  expect(saturday).toHaveAttribute('aria-expanded', 'false');
  await act(() => userEvent.keyboard(' '));
  expect(saturday).toHaveAttribute('aria-expanded', 'true');
  expect(saturday).toHaveFocus();
});

it('does not carry a collapsed day into a different person on repeated navigation', async () => {
  const { rerender } = render(<PersonalScheduleContent person={person} />);
  await act(() => userEvent.click(screen.getByText('Saturday')));
  rerender(<PersonalScheduleContent person={{ ...person, registrantId: 2 }} />);
  expect(screen.getByRole('button', { name: 'Saturday' })).toHaveAttribute('aria-expanded', 'true');
  rerender(<PersonalScheduleContent person={person} />);
  expect(screen.getByRole('button', { name: 'Saturday' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

const historicalAssignments = ['Saturday', 'Sunday'].map((date, index) => ({
  date,
  dateParts: [],
  approxDateTime: index,
  assignments: [
    {
      date,
      activity: { id: index + 1, endTime: '2020-01-01T12:00:00Z' },
      assignment: { activityId: index + 1 },
    },
  ],
})) as unknown as ReturnType<typeof getGroupedAssignmentsByDate>;

it.each([[[]], [['Saturday']], [['Sunday']]])(
  'respects saved personal historical day choices %j',
  (collapsed) => {
    jest.mocked(getGroupedAssignmentsByDate).mockReturnValue(historicalAssignments);
    localStorage.setItem(
      'collapse',
      JSON.stringify({ 'Test-1': collapsed, 'Test-2': ['Saturday'] }),
    );
    render(<PersonalScheduleContent person={person} />);
    for (const { date } of historicalAssignments) {
      expect(screen.getByRole('button', { name: date })).toHaveAttribute(
        'aria-expanded',
        String(!collapsed.includes(date)),
      );
    }
    expect(JSON.parse(localStorage.getItem('collapse')!)).toEqual({
      'Test-1': collapsed,
      'Test-2': ['Saturday'],
    });
  },
);

it.each([false, true])(
  'retains personal historical keyboard choices across reload (mixed: %s)',
  async (mixed) => {
    jest.mocked(getGroupedAssignmentsByDate).mockReturnValue(historicalAssignments);
    const { unmount } = render(<PersonalScheduleContent person={person} />);
    expect(screen.getByRole('button', { name: 'Saturday' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await act(() => userEvent.tab());
    await act(() => userEvent.keyboard('{Enter}'));
    await act(() => userEvent.tab());
    await act(() => userEvent.keyboard(' '));
    if (mixed) {
      await act(() => userEvent.tab({ shift: true }));
      await act(() => userEvent.keyboard('{Enter}'));
    }
    unmount();
    const { rerender } = render(<PersonalScheduleContent person={person} />);
    expect(screen.getByRole('button', { name: 'Saturday' })).toHaveAttribute(
      'aria-expanded',
      String(!mixed),
    );
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute('aria-expanded', 'true');
    rerender(<PersonalScheduleContent person={{ ...person, registrantId: 2 }} />);
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    rerender(<PersonalScheduleContent person={person} />);
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute('aria-expanded', 'true');
    expect(JSON.parse(localStorage.getItem('collapse')!)).toEqual({
      'Test-1': mixed ? ['Saturday'] : [],
    });
  },
);
