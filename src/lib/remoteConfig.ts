const rawNotifyCompApiOrigin =
  import.meta.env.VITE_NOTIFYCOMP_API_ORIGIN || 'https://api.notifycomp.com/api';

export const NOTIFYCOMP_GRAPHQL_ORIGIN = rawNotifyCompApiOrigin.endsWith('/graphql')
  ? rawNotifyCompApiOrigin
  : `${rawNotifyCompApiOrigin.replace(/\/$/, '')}/graphql`;

export const NOTIFYCOMP_API_ORIGIN = NOTIFYCOMP_GRAPHQL_ORIGIN.replace(/\/graphql$/, '');

export const NOTIFYCOMP_WS_ORIGIN =
  import.meta.env.VITE_NOTIFYCOMP_WS_ORIGIN || 'wss://api.notifycomp.com/api/graphql';
