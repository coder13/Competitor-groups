interface UserRowProps {
  user: User;
}

export const UserRow = ({ user }: UserRowProps) => {
  const avatarUrl = user.avatar?.thumb_url;

  return (
    <li className="w-full rounded flex border border-slate-400 space-x-2 justify-between hover:bg-slate-100 hover:border-slate-500 shadow transition-all">
      <a
        key={user.id}
        className="w-full flex"
        href={user.wca_id && `https://www.worldcubeassociation.org/persons/${user.wca_id}`}
        target="_blank"
        rel="noreferrer">
        <img className="w-16 h-16 rounded-l object-contain" src={avatarUrl} alt={user.name} />
        <div className="flex flex-1 flex-col px-2">
          <span className="text-xl">{user.name}</span>
          <span className="text-xs">{user.wca_id}</span>
        </div>
        {user.wca_id && (
          <div className="p-2 flex items-center">
            <i className="m-0 fa fa-solid fa-arrow-up-right-from-square" />
          </div>
        )}
      </a>
    </li>
  );
};
