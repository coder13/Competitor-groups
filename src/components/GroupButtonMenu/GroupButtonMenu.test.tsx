import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Competition } from '@wca/helpers';
import { MemoryRouter } from 'react-router-dom';
import { GroupButtonMenu } from './GroupButtonMenu';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ competitionId: 'TestComp2023' }),
}));

// Mock activity codes helper
jest.mock('@/lib/activityCodes', () => ({
  prevActivityCode: (_wcif: Competition, activityCode: string) => {
    if (activityCode === '333-r1-g2') return '333-r1-g1';
    return null;
  },
  nextActivityCode: (_wcif: Competition, activityCode: string) => {
    if (activityCode === '333-r1-g2') return '333-r1-g3';
    return null;
  },
}));

const mockWcif: Competition = {
  formatVersion: '1.0',
  id: 'TestComp2023',
  name: 'Test Competition 2023',
  shortName: 'TestComp2023',
  persons: [],
  events: [],
  schedule: {
    startDate: '2023-01-01',
    numberOfDays: 1,
    venues: [],
  },
  competitorLimit: 100,
  extensions: [],
};

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, {
    wrapper: MemoryRouter,
  });
}

describe('GroupButtonMenu', () => {
  beforeEach(() => {
    mockNavigate.mockClear();

    // Clear event listeners
    const _events: Record<string, unknown> = {};
    document.addEventListener = jest.fn((_event, _cb) => {
      // No-op for tests
    });
    document.removeEventListener = jest.fn((_event) => {
      // No-op for tests
    });
  });

  it('renders navigation buttons', () => {
    renderWithRouter(<GroupButtonMenu wcif={mockWcif} activityCode="333-r1-g2" />);

    expect(screen.getByText('competition.groups.previousGroup')).toBeInTheDocument();
    expect(screen.getByText('competition.groups.nextGroup')).toBeInTheDocument();
  });

  it('enables both buttons when prev and next exist', () => {
    renderWithRouter(<GroupButtonMenu wcif={mockWcif} activityCode="333-r1-g2" />);

    const prevButton = screen.getByRole('link', { name: /previousGroup/ });
    const nextButton = screen.getByRole('link', { name: /nextGroup/ });

    expect(prevButton).not.toHaveClass('pointer-events-none');
    expect(nextButton).not.toHaveClass('pointer-events-none');
    expect(prevButton).toHaveAttribute('href', '/competitions/TestComp2023/events/333-r1/1');
    expect(nextButton).toHaveAttribute('href', '/competitions/TestComp2023/events/333-r1/3');
  });

  it('disables buttons when no prev/next available', () => {
    renderWithRouter(<GroupButtonMenu wcif={mockWcif} activityCode="333-r1-g1" />);

    const prevButton = screen.getByRole('link', { name: /previousGroup/ });
    const nextButton = screen.getByRole('link', { name: /nextGroup/ });

    expect(prevButton).toHaveClass('pointer-events-none opacity-25');
    expect(nextButton).toHaveClass('pointer-events-none opacity-25');
  });

  it('handles missing wcif gracefully', () => {
    renderWithRouter(<GroupButtonMenu wcif={undefined} activityCode="333-r1-g2" />);

    const prevButton = screen.getByRole('link', { name: /previousGroup/ });
    const nextButton = screen.getByRole('link', { name: /nextGroup/ });

    expect(prevButton).toHaveClass('pointer-events-none opacity-25');
    expect(nextButton).toHaveClass('pointer-events-none opacity-25');
  });
});
