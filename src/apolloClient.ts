import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { getNotifyCompRemoteToken } from './lib/notifyCompRemoteAuth';
import { setNotifyCompWebSocketStatus } from './lib/notifyCompWebSocketStatus';
import { NOTIFYCOMP_GRAPHQL_ORIGIN, NOTIFYCOMP_WS_ORIGIN } from './lib/remoteConfig';

const httpLink = createHttpLink({
  uri: NOTIFYCOMP_GRAPHQL_ORIGIN,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: NOTIFYCOMP_WS_ORIGIN,
    on: {
      connecting: () => {
        setNotifyCompWebSocketStatus({ status: 'connecting' });
      },
      connected: () => {
        setNotifyCompWebSocketStatus({ status: 'connected' });
      },
      closed: () => {
        setNotifyCompWebSocketStatus({ status: 'disconnected' });
      },
      error: () => {
        setNotifyCompWebSocketStatus({
          status: 'disconnected',
          message:
            'Unable to connect to NotifyComp live updates. Activity changes may not update automatically.',
        });
      },
    },
  }),
);

const authLink = setContext((_, { headers }) => {
  const token = getNotifyCompRemoteToken();

  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});

export default client;
