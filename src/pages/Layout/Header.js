import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

export default function Header() {
  const { user, signIn, signOut } = useAuth();
  return (
    <header className="flex shadow-md p-2 h-12 items-center print:hidden">
      <Link to="/" className="text-blue-500">
        View Competitions
      </Link>
      <div className="flex flex-1" />
      {user ? (
        <>
          {user.avatar?.thumb_url && (
            <div className="m-1 mr-2 w-8 h-8 relative flex justify-center items-center rounded-full bg-gray-500 text-xl text-white">
              <img src={user.avatar?.thumb_url} alt={user.name} className="rounded-full" />
            </div>
          )}
          <button onClick={signOut} className="text-blue-500 mx-2">
            Logout
          </button>
        </>
      ) : (
        <button onClick={signIn} className="text-blue-500 mx-2">
          Login
        </button>
      )}
    </header>
  );
}
