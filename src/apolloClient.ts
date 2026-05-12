import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { getNotifyCompRemoteToken } from './lib/notifyCompRemoteAuth';
import { NOTIFYCOMP_GRAPHQL_ORIGIN, NOTIFYCOMP_WS_ORIGIN } from './lib/remoteConfig';

const httpLink = createHttpLink({
  uri: NOTIFYCOMP_GRAPHQL_ORIGIN,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: NOTIFYCOMP_WS_ORIGIN,
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
