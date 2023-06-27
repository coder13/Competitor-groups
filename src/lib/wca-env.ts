export const WCA_ORIGIN =
  process.env.REACT_APP_WCA_ORIGIN || 'https://api.worldcubeassociation.org';
export const WCA_OAUTH_CLIENT_ID = process.env.REACT_APP_WCA_CLIENT_ID || 'example-application-id';

// For debug purposes
global.WCA_ORIGIN = WCA_ORIGIN;
global.WCA_OAUTH_CLIENT_ID = WCA_OAUTH_CLIENT_ID;
