export const byName = (a, b) => a.name.localeCompare(b.name);
export const byDate = (a, b) => new Date(a.startTime) - new Date(b.startTime);

export const unique = (v, i, arr) => {
  // compare index with first element index
  return i === arr.indexOf(v);
};

export const flatten = (arr) => arr.reduce((xs, x) => xs.concat(x), []);

export const flatMap = (arr, fn) => arr.reduce((xs, x) => xs.concat(fn(x)), []);

export const groupBy = (xs, getKey) =>
  xs.reduce((rv, x) => {
    (rv[getKey(x)] ||= []).push(x);
    return rv;
  }, {});

export const groupByMap = (xs, getKey, fn) => {
  const grouped = groupBy(xs, getKey);
  Object.keys(grouped).forEach((key) => {
    grouped[key] = fn(grouped[key]);
  });
  return grouped;
};

export const shortTime = (isoString, timeZone = 'UTC') =>
  new Date(isoString).toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
  });
