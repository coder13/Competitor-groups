import { fireEvent, render, screen } from '@testing-library/react';
import { PinCompetitionButton } from './PinCompetitionButton';

const mockPin = jest.fn();
const mockUnpin = jest.fn();
const mockCompetition = { id: 'TestCompetition2026' };
let mockPinned = false;

jest.mock('@/hooks/queries/useCompetition', () => ({
  useCompetition: () => ({ data: mockCompetition }),
}));
jest.mock('@/hooks/UsePinnedCompetitions', () => ({
  usePinnedCompetitions: () => ({
    pinnedCompetitions: mockPinned ? [mockCompetition] : [],
    pinCompetition: mockPin,
    unpinCompetition: mockUnpin,
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'common.bookmarkCompetition' ? 'Bookmark competition' : key),
  }),
}));

it('exposes a named bookmark toggle and updates its pressed state after pinning/unpinning', () => {
  mockPinned = false;
  const { rerender } = render(<PinCompetitionButton competitionId={mockCompetition.id} />);
  const button = screen.getByRole('button', { name: 'Bookmark competition', pressed: false });

  fireEvent.click(button);
  expect(mockPin).toHaveBeenCalledWith(mockCompetition);

  mockPinned = true;
  rerender(<PinCompetitionButton competitionId={mockCompetition.id} />);
  fireEvent.click(screen.getByRole('button', { name: 'Bookmark competition', pressed: true }));
  expect(mockUnpin).toHaveBeenCalledWith(mockCompetition.id);

  mockPinned = false;
  rerender(<PinCompetitionButton competitionId={mockCompetition.id} />);
  expect(
    screen.getByRole('button', { name: 'Bookmark competition', pressed: false }),
  ).toBeEnabled();
});
