export const UserRow = ({ user }: { user: User }) => {
  const avatarUrl = user.avatar?.thumb_url;

  return (
    <li className="flex justify-between w-full space-x-2 transition-all border rounded shadow border-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-500 dark:hover:border-gray-600 dark:shadow-gray-800">
      <a
        key={user.id}
        className="flex w-full"
        href={user.wca_id && `https://www.worldcubeassociation.org/persons/${user.wca_id}`}
        target="_blank"
        rel="noreferrer">
        <img className="object-contain w-16 h-16 rounded-l" src={avatarUrl} alt={user.name} />
        <div className="flex flex-col flex-1 px-2">
          <span className="type-heading">{user.name}</span>
          <span className="type-meta">{user.wca_id}</span>
        </div>
        {user.wca_id && (
          <div className="flex items-center p-2">
            <i className="m-0 fa fa-solid fa-arrow-up-right-from-square" />
          </div>
        )}
      </a>
    </li>
  );
};
