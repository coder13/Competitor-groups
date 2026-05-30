import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';
import { configureUmamiAnalytics, identifyUser, loadUmamiScript } from '@/lib/analytics';
import { useAuth } from '@/providers/AuthProvider';

export const usePageTracking = (trackingCode?: string) => {
  const location = useLocation();
  const { user } = useAuth();
  const umamiSrc = import.meta.env.VITE_UMAMI_SRC;
  const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

  configureUmamiAnalytics({
    src: umamiSrc,
    websiteId: umamiWebsiteId,
  });

  useEffect(() => {
    loadUmamiScript({
      src: umamiSrc,
      websiteId: umamiWebsiteId,
    });
  }, [umamiSrc, umamiWebsiteId]);

  useEffect(() => {
    identifyUser(user?.id);
  }, [user?.id]);

  useEffect(() => {
    if (!trackingCode || ReactGA.isInitialized) {
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
    } else if (trackingCode && !ReactGA.isInitialized) {
      console.log('Would have set userId to', user?.id);
    }
  }, [trackingCode, user]);

  useEffect(() => {
    if (ReactGA.isInitialized) {
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname + location.search,
        title: document.title,
      });
    } else if (trackingCode) {
      console.log('Would have logged pageview for', location);
    }
  }, [location, trackingCode]);
};
