import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
import { useAuth } from '../providers/AuthProvider';

const usePageTracking = (trackingCode) => {
  const location = useLocation();
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    ReactGA.initialize(trackingCode, {
      debug: window.location.href.includes('localhost'),
      gaOptions: {
        ...(user?.id
          ? {
              userId: user?.id?.toString(),
              delegate_status: user?.delegate_status,
            }
          : {}),
      },
    });
    setInitialized(true);
  }, [trackingCode, user]);

  useEffect(() => {
    if (initialized && user?.id) {
      ReactGA.set({
        userId: user.id,
        delegate_status: user.delegate_status,
      });
    } else if (initialized && !user?.id) {
      ReactGA.set({
        userId: null,
        delegate_status: null,
      });
    } else if (!initialized) {
      console.log('Would have set userId to', user?.id);
    }
  }, [initialized, user?.id]);

  useEffect(() => {
    if (initialized) {
      ReactGA.pageview(location.pathname + location.search);
    } else {
      console.log('Would have logged pageview for', location);
    }
  }, [initialized, location]);
};

export default usePageTracking;
