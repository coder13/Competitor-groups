import { useEffect, useState } from 'react';

export const useNow = (interval: number = 1000) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const int = setInterval(() => {
      setNow(new Date());
    }, interval);
    return () => clearInterval(int);
  }, [interval]);
  return now;
};
