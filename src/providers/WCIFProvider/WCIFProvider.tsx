import { Competition } from '@wca/helpers';
import { useState, useEffect, useMemo } from 'react';
import ReactGA from 'react-ga4';
import { prefetchCompetition } from '@/hooks/queries/useCompetition';
import { useWcif } from '@/hooks/queries/useWcif';
import { WCIFContext } from './WCIFContext';

export interface WCIFProviderProps {
  competitionId?: string;
  children: React.ReactNode;
}

export function WCIFProvider({ competitionId, children }: WCIFProviderProps) {
  const [title, setTitle] = useState('');
  const { data: wcif, error } = useWcif(competitionId);

  useEffect(() => {
    if (!competitionId) {
      return;
    }

    void prefetchCompetition(competitionId);
  }, [competitionId]);

  useEffect(() => {
    if (wcif) {
      document.title = title
        ? `${title} - ${wcif.shortName} - Competition Groups`
        : `${wcif.shortName} - Competition Groups`;
    }

    if (ReactGA.isInitialized) {
      ReactGA.set({
        competitionId,
        content_group: competitionId,
      });
    }

    return () => {
      if (ReactGA.isInitialized) {
        ReactGA.set({
          competitionId: null,
          content_group: null,
        });
      }
    };
  }, [wcif, title, competitionId]);

  const value = useMemo(() => {
    return {
      competitionId: wcif?.id || competitionId || '',
      wcif: wcif as Competition,
      setTitle,
    };
  }, [competitionId, wcif]);

  return (
    <WCIFContext.Provider value={value}>
      {error && (
        <div className="flex">
          <p>Error loading competition: </p>
          <p>{error?.toString()}</p>
        </div>
      )}
      {children}
    </WCIFContext.Provider>
  );
}
