import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import Home from '../Home';

export default function UserLogin() {
  const { signInAs } = useAuth();
  const { userId } = useParams();

  useEffect(() => {
    document.title = 'Competition Groups';

    if (!userId) {
      return;
    }

    signInAs(Number(userId));
  }, [signInAs, userId]);

  return <Home />;
}
