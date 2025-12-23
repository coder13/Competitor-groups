import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { UserRow } from './UserRow';

const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  wca_id: '2023DOEJ01',
  avatar: {
    thumb_url: 'https://example.com/avatar.jpg',
  },
  delegate_status: 'none',
};

const mockUserNoWcaId: User = {
  id: 2,
  name: 'Jane Smith',
  email: 'jane@example.com',
  wca_id: '',
  delegate_status: 'none',
};

describe('UserRow', () => {
  it('renders user with WCA ID correctly', () => {
    render(<UserRow user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2023DOEJ01')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'John Doe' })).toHaveAttribute(
      'src',
      'https://example.com/avatar.jpg',
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.worldcubeassociation.org/persons/2023DOEJ01',
    );
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });

  it('renders user without WCA ID correctly', () => {
    render(<UserRow user={mockUserNoWcaId} />);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '');
    expect(
      screen.queryByRole('button', { name: /fa-arrow-up-right-from-square/ }),
    ).not.toBeInTheDocument();
  });

  it('renders with missing avatar', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined };
    render(<UserRow user={userWithoutAvatar} />);

    expect(screen.getByRole('img')).not.toHaveAttribute('src');
  });
});
