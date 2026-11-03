import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Person } from '@wca/helpers';
import { PersonalScheduleContent } from './PersonalSchedule';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/components', () => ({ DisclaimerText: () => null }));
jest.mock('@/providers/WCIFProvider', () => ({ useWCIF: () => ({ wcif: { id: 'Test' } }) }));
jest.mock('@/hooks/useNow/useNow', () => ({ useNow: () => 0 }));
jest.mock('@/lib/events', () => ({ isOfficialEventId: jest.fn() }));
jest.mock('@/lib/activityCodes', () => ({ parseActivityCodeFlexible: jest.fn() }));
jest.mock('@/lib/activities', () => ({ hasMultipleScheduleLocations: () => false }));
jest.mock('./utils', () => ({
  getGroupedAssignmentsByDate: () => [
    { date: 'Saturday', dateParts: [], assignments: [] },
    { date: 'Sunday', dateParts: [], assignments: [] },
  ],
}));
jest.mock('./PersonalExtraAssignment', () => ({ ExtraAssignment: () => null }));
jest.mock('./PersonalNormalAssignment', () => ({ PersonalNormalAssignment: () => null }));
jest.mock('./PersonalPageLayout', () => ({ PersonalPageLayout: () => null }));

const person = { registrantId: 1, assignments: [{ activityId: 1 }] } as Person;
beforeEach(() => localStorage.clear());

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
