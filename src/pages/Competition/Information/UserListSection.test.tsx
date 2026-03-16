import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { UserListSection } from './UserListSection';

describe('UserListSection', () => {
  it('renders users', () => {
    const users: User[] = [
      {
        id: 1,
        name: 'Alex Tester',
        email: 'alex@example.com',
        wca_id: '2010TEST01',
        delegate_status: 'delegate',
        avatar: {
          thumb_url: 'https://example.com/avatar.png',
        },
      },
      {
        id: 2,
        name: 'Jamie Example',
        email: 'jamie@example.com',
        wca_id: '2012EXAM01',
        delegate_status: 'trainee',
      },
    ];

    render(<UserListSection users={users} />);

    expect(screen.getByText('Alex Tester')).toBeInTheDocument();
    expect(screen.getByText('Jamie Example')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
