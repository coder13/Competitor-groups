import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { fetchUser, fetchUserWithCompetitions } from '../../lib/api';
import Home from '../Home';
import { queryClient } from '../../providers/QueryProvider';

export default function UserLogin() {
  const { setUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Competition Groups';

    if (!userId) {
      return;
    }

    queryClient
      .getQueryCache()
      .find({
        queryKey: ['userCompetitions'],
      })
      ?.reset();

    fetchUserWithCompetitions(userId).then(
      ({ user, ongoing_competitions, upcoming_competitions }) => {
        setUser(user);
        queryClient.setQueryData(['userCompetitions'], {
          ongoing_competitions,
          upcoming_competitions,
        });
        navigate('/', { replace: true });
      }
    );
  }, []);

  return <Home />;
}
