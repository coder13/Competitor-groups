import { createContext, useContext, useState, useEffect, useReducer, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useWCAFetch from '../../hooks/useWCAFetch';
import { Container, Item } from '../../components/Grid';

const INITIAL_STATE = {
  id: undefined,
  name: undefined,
  persons: [],
  events: [],
  schedule: {
    venues: [],
  },
};

const WCIFContext = createContext();

function WCIFReducer(state, { type, payload }) {
  switch (type) {
    case 'SET':
      return {
        ...payload,
      };
    default: {
      throw new Error(`Unhandled action type ${type}`);
    }
  }
}

export default function WCIFProvider({ competitionId, children }) {
  const [wcif, dispatch] = useReducer(WCIFReducer, INITIAL_STATE);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(true);
  const wcaApiFetch = useWCAFetch();

  const fetchCompetition = useCallback(async () => {
    setFetching(true);
    try {
      const data = await wcaApiFetch(`/competitions/${competitionId}/wcif/public`);
      dispatch({
        type: 'SET',
        payload: data,
      });
      setFetching(false);
    } catch (e) {
      console.error(e);
      setError(e);
      setFetching(false);
    }
  }, [competitionId, wcaApiFetch]);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  console.log(50, fetching, error, wcif);
  return (
    <WCIFContext.Provider value={{ wcif, fetchCompetition, error, dispatch }}>
      {fetching && !error ? (
        'Loading...'
      ) : (
        <Container>
          <Item
            shrink
            row
            style={{
              backgroundColor: '#CCC',
              padding: '0.5em',
              boxShadow:
                '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
            }}>
            <Link to={`/competitions/${wcif.id}`}>{wcif.name}</Link>
          </Item>
          <Item>{children}</Item>
        </Container>
      )}
    </WCIFContext.Provider>
  );
}

export const useWCIF = () => useContext(WCIFContext);
