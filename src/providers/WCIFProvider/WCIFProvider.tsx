import { useState, useEffect } from 'react';
import { Competition } from '@wca/helpers';
import { useWcif } from '../../hooks/queries/useWcif';
import { prefetchCompetition } from '../../hooks/queries/useCompetition';
import { WCIFContext } from './WCIFContext';
import ReactGA from 'react-ga4';

export interface WCIFProvider {
  competitionId?: string;
  children: React.ReactNode;
}

export function WCIFProvider({ competitionId, children }) {
  const [title, setTitle] = useState('');
  const { data: wcif, error } = useWcif(competitionId);

  useEffect(() => {
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
  }, [wcif, title]);

  return (
    <WCIFContext.Provider value={{ wcif: wcif as Competition, setTitle }}>
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
