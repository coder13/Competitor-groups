import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useCompareSchedulesState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPersonIds = useMemo(
    () => searchParams.get('persons')?.split(',').map(Number).filter(Boolean) || [],
    [searchParams],
  );

  const addPerson = useCallback(
    (registrantId: number) => {
      const currentIds = new Set(selectedPersonIds);
      currentIds.add(registrantId);
      const newIds = Array.from(currentIds).sort();

      const params = new URLSearchParams(searchParams);
      if (newIds.length > 0) {
        params.set('persons', newIds.join(','));
      } else {
        params.delete('persons');
      }
      setSearchParams(params);
    },
    [selectedPersonIds, searchParams, setSearchParams],
  );

  const removePerson = useCallback(
    (registrantId: number) => {
      const currentIds = new Set(selectedPersonIds);
      currentIds.delete(registrantId);
      const newIds = Array.from(currentIds).sort();

      const params = new URLSearchParams(searchParams);
      if (newIds.length > 0) {
        params.set('persons', newIds.join(','));
      } else {
        params.delete('persons');
      }
      setSearchParams(params);
    },
    [selectedPersonIds, searchParams, setSearchParams],
  );

  const togglePerson = useCallback(
    (registrantId: number) => {
      if (selectedPersonIds.includes(registrantId)) {
        removePerson(registrantId);
      } else {
        addPerson(registrantId);
      }
    },
    [selectedPersonIds, addPerson, removePerson],
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('persons');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  return {
    selectedPersonIds,
    addPerson,
    removePerson,
    togglePerson,
    clearAll,
  };
};
