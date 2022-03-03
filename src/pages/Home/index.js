import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import CompetitionList from './CompetitionList';

export default function Home() {
  const { signedIn } = useAuth();

  if (signedIn()) {
    return <CompetitionList />
  }

  return (
    <div>
      Sign in to view competitions!
    </div>
  );
}
