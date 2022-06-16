import {
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
  useCallback,
  PropsWithChildren,
  Dispatch,
} from 'react';
import { Link } from 'react-router-dom';
import useWCAFetch from '../../hooks/useWCAFetch';
import ReactLoading from 'react-loading';
import { Competition } from '@wca/helpers';

interface WCIFContextProps {
  wcif: Competition | null;
  refetch: () => Promise<void>;
  error: Error | null;
}

const WCIFContext = createContext<WCIFContextProps | null>(null);

interface WCIFProviderProps extends PropsWithChildren {
  competitionId: string;
}

export default function WCIFProvider({ competitionId, children }: WCIFProviderProps) {
  const [wcif, setWcif] = useState<Competition | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const wcaApiFetch = useWCAFetch();

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wcaApiFetch(`/competitions/${competitionId}/wcif/public`);
      if (data) {
        setWcif(data);
      }
      setLoading(false);
    } catch (e: any) {
      console.error(e);
      setError(e);
      setLoading(false);
    }
  }, [competitionId, wcaApiFetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <div className="flex">
        <p>Error loading competition: </p>
        <p>{error.toString()}</p>
      </div>
    );
  }

  if (!wcif) {
    return <div className="flex">No WCIF</div>;
  }

  console.log(50, loading, error, wcif);
  return (
    <WCIFContext.Provider value={{ wcif, refetch, error }}>
      {loading && !error ? (
        <ReactLoading type="cubes" />
      ) : (
        <div className="flex flex-col w-full h-full">
<<<<<<< Updated upstream:src/pages/Competition/WCIFProvider.js
          <div className="flex flex-row p-2 shadow-md">
            <Link to={`/competitions/${wcif.id}`}>{wcif.name}</Link>
=======
          <div className="flex flex-row shadow-md pl-2">
            <Link
              to={`/competitions/${wcif.id}`}
              className="p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700">
              {wcif.name}
            </Link>
            <Link
              to={`/competitions/${wcif.id}/events`}
              className="p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700">
              Events
            </Link>
            <Link
              to={`/competitions/${wcif.id}/activities`}
              className="p-3 text-blue-500 hover:bg-gray-100 hover:text-blue-700">
              Schedule
            </Link>
>>>>>>> Stashed changes:src/pages/Competition/WCIFProvider.tsx
          </div>
          <div className="flex flex-col w-full items-center">
            <div className="w-full md:w-1/2">{children}</div>
          </div>
        </div>
      )}
    </WCIFContext.Provider>
  );
}

export const useWCIF = () => useContext(WCIFContext);
