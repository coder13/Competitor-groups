import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePinnedPersons } from '@/hooks/UsePinnedPersons';
import { useAuth } from '@/providers/AuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import { PersonSelector } from './PersonSelector';

// Mock the hooks and providers
jest.mock('@/hooks/UsePinnedPersons', () => ({
  usePinnedPersons: jest.fn(),
}));

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: jest.fn(),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockUsePinnedPersons = usePinnedPersons as jest.MockedFunction<typeof usePinnedPersons>;
const mockUseWCIF = useWCIF as jest.MockedFunction<typeof useWCIF>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockPersons = [
  {
    registrantId: 1,
    name: 'John Doe',
    wcaUserId: 1,
    registration: { eventIds: ['333'], status: 'accepted' },
    assignments: [{ activityId: 'activity1' }],
  },
  {
    registrantId: 2,
    name: 'Jane Smith',
    wcaUserId: 2,
    registration: { eventIds: ['333'], status: 'accepted' },
    assignments: [{ activityId: 'activity2' }],
  },
];

const mockPinPerson = jest.fn();
const mockUnpinPerson = jest.fn();

describe('PersonSelector', () => {
  beforeEach(() => {
    mockPinPerson.mockClear();
    mockUnpinPerson.mockClear();

    mockUseWCIF.mockReturnValue({
      wcif: {
        persons: mockPersons,
        formatVersion: '1.0',
        id: 'test-comp',
        name: 'Test Competition',
        shortName: 'Test',
      } as any,
      competitionId: 'test-comp',
      setTitle: jest.fn(),
    });

    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        wca_id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        delegate_status: '',
      },
      signIn: jest.fn(),
      signOut: jest.fn(),
      setUser: jest.fn(),
      signInAs: jest.fn(),
    });

    mockUsePinnedPersons.mockReturnValue({
      pinnedPersons: [],
      pinPerson: mockPinPerson,
      unpinPerson: mockUnpinPerson,
    });
  });

  it('renders search input and person list', () => {
    render(<PersonSelector />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument(); // Should exclude current user by default
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('shows current user when showCurrentUser is true', () => {
    render(<PersonSelector showCurrentUser />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('filters persons based on search input', () => {
    render(<PersonSelector showCurrentUser />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('calls pinPerson when unpinned person is clicked', () => {
    render(<PersonSelector showCurrentUser />);

    const janeButton = screen.getByText('Jane Smith').closest('div');
    if (janeButton) {
      fireEvent.click(janeButton);
    }

    expect(mockPinPerson).toHaveBeenCalledWith(2);
  });

  it('calls unpinPerson when pinned person is clicked', () => {
    mockUsePinnedPersons.mockReturnValue({
      pinnedPersons: [2],
      pinPerson: mockPinPerson,
      unpinPerson: mockUnpinPerson,
    });

    render(<PersonSelector showCurrentUser />);

    const janeButton = screen.getByText('Jane Smith').closest('div');
    if (janeButton) {
      fireEvent.click(janeButton);
    }

    expect(mockUnpinPerson).toHaveBeenCalledWith(2);
  });

  it('shows no persons message when wcif is empty', () => {
    mockUseWCIF.mockReturnValue({
      wcif: {
        persons: [],
        formatVersion: '1.0',
        id: 'test-comp',
        name: 'Test Competition',
        shortName: 'Test',
      } as any,
      competitionId: 'test-comp',
      setTitle: jest.fn(),
    });

    render(<PersonSelector />);

    expect(screen.getByText('competition.compareSchedules.noPersonsAvailable')).toBeInTheDocument();
  });

  it('shows no search results message when search yields no results', () => {
    render(<PersonSelector showCurrentUser />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('competition.compareSchedules.noPersonsFound')).toBeInTheDocument();
  });

  it('calls onPersonToggle callback when provided', () => {
    const mockCallback = jest.fn();
    render(<PersonSelector onPersonToggle={mockCallback} showCurrentUser />);

    const janeButton = screen.getByText('Jane Smith').closest('div');
    if (janeButton) {
      fireEvent.click(janeButton);
    }

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockPersons[1],
        isPinned: false,
      }),
      true,
    );
  });
});
