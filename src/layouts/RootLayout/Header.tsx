import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Popover } from 'react-tiny-popover';
import { useWcif } from '@/hooks/queries/useWcif';
import { useAuth } from '@/providers/AuthProvider';

export default function Header() {
  const { user, signIn, signOut } = useAuth();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { competitionId } = useParams();

  const { data: wcif } = useWcif(competitionId);

  return (
    <header className="flex w-full shadow-md p-2 h-12 items-center print:hidden z-20 bg-white">
      <div className="flex items-center space-x-1">
        <Link to="/" className="text-blue-500">
          <i className="fa fa-home" />
        </Link>
        {wcif && (
          <>
            <span>{' / '}</span>
            <Link to={`/competitions/${wcif?.id || competitionId}`} className="text-blue-500">
              {wcif?.shortName}
            </Link>
          </>
        )}
      </div>
      <div className="flex flex-1" />
      {user ? (
        <Popover
          isOpen={isPopoverOpen}
          positions={['bottom']} // if you'd like, you can limit the positions
          align="end"
          onClickOutside={() => setIsPopoverOpen(false)} // handle click events outside of the popover/target here!
          containerStyle={{
            zIndex: '50',
          }} // a style object to be applied to the popover container
          content={
            <div
              className="bg-white border-2 shadow-xl mt-2 z-50"
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
              <button onClick={signOut} className="text-blue-500 px-3 py-2 w-32 hover:bg-gray-100">
                Logout
              </button>
            </div>
          }>
          <div
            className="w-10 h-10 relative flex justify-center items-center rounded-full cursor-pointer"
            onClick={() => setIsPopoverOpen((prev) => !prev)}>
            <img src={user.avatar?.thumb_url || ''} alt={user.name} className="rounded-full" />
          </div>
        </Popover>
      ) : (
        <button onClick={signIn} className="text-blue-500 mx-2">
          Login
        </button>
      )}
    </header>
  );
}
