/* Customized history preserving `staging` query parameter on location change. */

import { createBrowserHistory, BrowserHistory, To } from 'history';

const preserveQueryParams = (history: BrowserHistory, location: To) => {
  const query = new URLSearchParams(history.location.search);
  const newQuery = new URLSearchParams(location.search as string);
  if (query.has('staging')) {
    newQuery.set('staging', 'true');
    location.search = newQuery.toString();
  }
  return location;
};

const createLocationObject = (path: To, state: any): To => {
  return typeof path === 'string' ? { pathname: path } : path;
};

const history = createBrowserHistory();

const originalPush = history.push;
history.push = (path: To, state: any) => {
  return originalPush.apply(history, [
    preserveQueryParams(history, createLocationObject(path, state)),
  ]);
};

const originalReplace = history.replace;
history.replace = (path: To, state: any) => {
  return originalReplace.apply(history, [
    preserveQueryParams(history, createLocationObject(path, state)),
  ]);
};

export default history;
