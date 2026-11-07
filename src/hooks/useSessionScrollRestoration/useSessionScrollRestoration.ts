import { RefObject, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { restoreScroll } from './restoreScroll';
import { createScrollPositionStore } from './scrollPositions';

export function useSessionScrollRestoration(root: RefObject<HTMLElement>) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [store] = useState(createScrollPositionStore);
  const initialEntry = useRef(true);
  const [freshDocument] = useState(() => {
    const navigation = performance.getEntriesByType?.('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    return navigation?.type === 'navigate';
  });
  const url = location.pathname + location.search + location.hash;

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    if (!root.current) return;
    // PUSH/REPLACE are new views. POP and reload restore this exact history entry,
    // never the last position of a different visit to the same URL.
    const isFreshInitialEntry = initialEntry.current && freshDocument;
    initialEntry.current = false;
    const saved =
      navigationType === 'POP' && !isFreshInitialEntry ? store.get(location.key, url) : undefined;
    const controller = restoreScroll(root.current, saved);
    const persist = () => store.set(location.key, url, controller.snapshot(true));
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') persist();
    };
    window.addEventListener('pagehide', persist);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      // DOM mutations may already have clamped the old pane. Use its last scroll
      // event, not its now-replaced content, when leaving the history entry.
      store.set(location.key, url, controller.snapshot());
      controller.dispose();
      window.removeEventListener('pagehide', persist);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [root, store, location.key, url, navigationType, freshDocument]);
}
