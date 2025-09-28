import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCompareSchedulesState } from '@/hooks/useCompareSchedulesState';
import { useWCIF } from '@/providers/WCIFProvider';
import { CompareSchedulesButton } from './CompareSchedulesButton';

// Mock the hooks and providers
jest.mock('@/hooks/useCompareSchedulesState', () => ({
  useCompareSchedulesState: jest.fn(),
}));

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: jest.fn(),
}));

jest.mock('@/components/PersonSelector', () => ({
  PersonSelector: ({ onPersonToggle }: { onPersonToggle: () => void }) => (
    <div data-testid="person-selector">
      <button onClick={onPersonToggle}>Toggle Person</button>
    </div>
  ),
}));

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUseCompareSchedulesState = useCompareSchedulesState as jest.MockedFunction<
  typeof useCompareSchedulesState
>;
const mockUseWCIF = useWCIF as jest.MockedFunction<typeof useWCIF>;

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, {
    wrapper: MemoryRouter,
  });
}

describe('CompareSchedulesButton', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseWCIF.mockReturnValue({
      competitionId: 'test-comp-123',
      wcif: undefined,
      setTitle: jest.fn(),
    });
  });

  it('renders with default props', () => {
    mockUseCompareSchedulesState.mockReturnValue({
      selectedPersonIds: [],
      addPerson: jest.fn(),
      removePerson: jest.fn(),
      togglePerson: jest.fn(),
      clearAll: jest.fn(),
    });

    renderWithRouter(<CompareSchedulesButton />);

    expect(screen.getByText('competition.compareSchedules.buttonText')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens modal when clicked and no selected persons', () => {
    mockUseCompareSchedulesState.mockReturnValue({
      selectedPersonIds: [],
      addPerson: jest.fn(),
      removePerson: jest.fn(),
      togglePerson: jest.fn(),
      clearAll: jest.fn(),
    });

    renderWithRouter(<CompareSchedulesButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('competition.compareSchedules.selectPeople')).toBeInTheDocument();
    expect(screen.getByTestId('person-selector')).toBeInTheDocument();
  });

  it('navigates directly when clicked and has selected persons', () => {
    mockUseCompareSchedulesState.mockReturnValue({
      selectedPersonIds: [1, 2],
      addPerson: jest.fn(),
      removePerson: jest.fn(),
      togglePerson: jest.fn(),
      clearAll: jest.fn(),
    });

    renderWithRouter(<CompareSchedulesButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/competitions/test-comp-123/compare-schedules');
  });

  it('renders with different variants and sizes', () => {
    mockUseCompareSchedulesState.mockReturnValue({
      selectedPersonIds: [],
      addPerson: jest.fn(),
      removePerson: jest.fn(),
      togglePerson: jest.fn(),
      clearAll: jest.fn(),
    });

    const { rerender } = renderWithRouter(<CompareSchedulesButton variant="primary" size="lg" />);

    expect(screen.getByRole('button')).toHaveClass('bg-blue-600', 'text-white');

    rerender(<CompareSchedulesButton variant="secondary" size="sm" />);

    expect(screen.getByRole('button')).toHaveClass('bg-white', 'border');
  });
});
