import { memo } from 'react';
import { UserRow } from './UserRow';

interface UserListSectionProps {
  users?: User[];
}

export const UserListSection = memo(function UserListSection({ users = [] }: UserListSectionProps) {
  return (
    <ul className="flex flex-col space-y-2">
      {users.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </ul>
  );
});
