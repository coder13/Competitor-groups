import { useEffect, useState } from 'react';

export const useNow = (interval: number = 1000) => {
  const [now, setNow] = useState(new Date('2024-07-18T16:19:00Z'));
  useEffect(() => {
    const int = setInterval(() => {
      setNow(new Date('2024-07-18T16:19:00Z'));
    }, interval);
    return () => clearInterval(int);
  }, []);
  return now;
};
