import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Person } from '@wca/helpers';
import { MemoryRouter } from 'react-router-dom';
import { CompetitorListItem } from './CompetitorListItem';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the AssignmentCodeCell component to avoid tailwind colors import issues
jest.mock('@/components/AssignmentCodeCell', () => ({
  AssignmentCodeCell: ({
    children,
    assignmentCode,
  }: {
    children?: React.ReactNode;
    assignmentCode?: string;
  }) => <div data-testid="assignment-code-cell">{children || assignmentCode}</div>,
}));

const mockPerson: Person = {
  registrantId: 1,
  name: 'John Doe',
  wcaUserId: 123,
  wcaId: '2023DOEJ01',
  countryIso2: 'US',
  gender: 'm',
  birthdate: '1990-01-01',
  email: 'john@example.com',
  avatar: {
    url: 'https://example.com/full.jpg',
    thumbUrl: 'https://example.com/thumb.jpg',
  },
  roles: [],
  assignments: [],
  personalBests: [],
  extensions: [],
  registration: {
    wcaRegistrationId: 1,
    eventIds: ['333'],
    status: 'accepted',
    isCompeting: true,
  },
};

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, {
    wrapper: MemoryRouter,
  });
}

describe('CompetitorListItem', () => {
  it('renders basic competitor item', () => {
    renderWithRouter(<CompetitorListItem person={mockPerson} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringContaining('persons/1'));
  });

  it('renders highlighted competitor with avatar', () => {
    renderWithRouter(<CompetitorListItem person={mockPerson} highlight />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('competition.competitors.viewMyAssignments')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/thumb.jpg');
  });

  it('renders bookmarked competitor', () => {
    renderWithRouter(<CompetitorListItem person={mockPerson} bookmarked />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('', { selector: '.fa-bookmark' })).toBeInTheDocument();
  });

  it('renders competitor with assignment', () => {
    renderWithRouter(<CompetitorListItem person={mockPerson} currentAssignmentCode="competitor" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // The AssignmentCodeCell should be rendered but we won't test its internals
  });

  it('does not show bookmark when assignment is present', () => {
    renderWithRouter(
      <CompetitorListItem person={mockPerson} bookmarked currentAssignmentCode="competitor" />,
    );

    expect(screen.queryByText('', { selector: '.fa-bookmark' })).not.toBeInTheDocument();
  });
});
