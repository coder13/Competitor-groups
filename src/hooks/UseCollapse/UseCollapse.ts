import { useLocalStorage } from '@uidotdev/usehooks';
import { useCallback, useRef, useState } from 'react';

export const useCollapse = (key: string, getDefaultCollapsedDates: () => string[] = () => []) => {
  const [initialCollapsed, saveCollapsed] = useLocalStorage<Record<string, string[]>>(
    `collapse`,
    {},
  );

  const [collapsedDates, setCollapsedDates] = useState<string[]>(() => {
    const savedDates = initialCollapsed?.[key];
    // An empty saved array is an explicit choice to expand every day. Defaults
    // apply only on initialization when this schedule has no saved preference.
    return Array.isArray(savedDates) ? savedDates : getDefaultCollapsedDates();
  });

  const collapsedDatesRef = useRef(collapsedDates);
  collapsedDatesRef.current = collapsedDates;

  const toggleDate = useCallback(
    (date: string) => {
      // Keep rapid toggles in order without writing to the external storage store
      // from a React state updater, which may run during rendering or be replayed.
      const previous = collapsedDatesRef.current;
      const next = previous.includes(date)
        ? previous.filter((collapsedDate) => collapsedDate !== date)
        : [...previous, date];
      collapsedDatesRef.current = next;
      setCollapsedDates(next);
      saveCollapsed((saved) => ({ ...saved, [key]: next }));
    },
    [key, saveCollapsed],
  );

  return {
    collapsedDates,
    setCollapsedDates,
    saveCollapsed,
    toggleDate,
  };
};
