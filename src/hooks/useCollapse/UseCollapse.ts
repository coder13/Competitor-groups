import { useLocalStorage } from '@uidotdev/usehooks';
import { startTransition, useCallback, useState } from 'react';

export const useCollapse = (key: string) => {
  const [initialCollapsed, saveCollapsed] = useLocalStorage<Record<string, string[]>>(
    `collapse`,
    {}
  );

  const [collapsedDates, setCollapsedDates] = useState<string[]>(() => {
    if (!initialCollapsed) {
      return [];
    }

    const collapsed = initialCollapsed[key];
    if (!collapsed || !Array.isArray(collapsed)) {
      return [];
    }

    return collapsed;
  });

  const toggleDate = useCallback((date: string) => {
    startTransition(() => {
      setCollapsedDates((prev) => {
        let newState = prev;
        if (prev.includes(date)) {
          newState = prev.filter((d) => d !== date);
        } else {
          newState = [...prev, date];
        }

        saveCollapsed({
          ...initialCollapsed,
          [key]: newState,
        });

        return newState;
      });
    });
  }, []);

  return {
    collapsedDates,
    setCollapsedDates,
    saveCollapsed,
    toggleDate,
  };
};
