import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="flex shadow-md p-2">
      <Link to="/" className="text-blue-500">
        View Competitions
      </Link>
    </header>
  );
}
