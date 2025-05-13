import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const usePageTracking = (trackingCode) => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (ReactGA.isInitialized) {
      return;
    }

    ReactGA.initialize(trackingCode, {
      // debug: window.location.href.includes('localhost'),
      testMode: import.meta.env.DEV || window.location.href.includes('localhost'),
      gaOptions: {
        ...(user?.id
          ? {
              userId: user.id.toString(),
              delegate_status: user.delegate_status,
            }
          : {}),
      },
    });
  }, [trackingCode, user]);

  useEffect(() => {
    if (ReactGA.isInitialized) {
      if (user?.id) {
        ReactGA.set({
          userId: user.id,
          delegate_status: user.delegate_status,
        });
      } else if (!user?.id) {
        ReactGA.set({
          userId: null,
          delegate_status: null,
        });
      }
    } else if (!ReactGA.isInitialized) {
      console.log('Would have set userId to', user?.id);
    }
  }, [user]);

  useEffect(() => {
    if (ReactGA.isInitialized) {
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname + location.search,
        title: document.title,
      });
    } else {
      console.log('Would have logged pageview for', location);
    }
  }, [location]);
};

export default usePageTracking;
