export const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
export const byDate = (a: { startTime: string }, b: { startTime: string }) =>
  new Date(a.startTime).getTime() - new Date(b.startTime).getTime();

/**
 * Use with filter
 * @param {*} v
 * @param {*} i
 * @param {*} arr
 * @returns
 */
export const unique = <T>(v: T, i: number, arr: T[]): boolean => {
  // compare index with first element index
  return i === arr.indexOf(v);
};

// export const flatten = <T>(arr: T[][]): T[] => arr.reduce((xs, x) => xs.concat(x), []);

// export const flatMap = <T, S>(arr: T[], fn: (x: T) => S): S[] =>
//   arr.reduce((xs: S[], x: T) => xs.concat(fn(x)), []);

export const groupBy = <T>(xs: T[], getKey: (x: T) => string): Record<string, T> =>
  xs.reduce((rv, x) => {
    (rv[getKey(x)] ||= []).push(x);
    return rv;
  }, {});

export const groupByMap = <T, S>(
  xs: T[],
  getKey: (x: T) => string,
  fn: (x: T) => S
): Record<string, S> => {
  const grouped = groupBy(xs, getKey);
  const newGrouped = {};
  Object.keys(grouped).forEach((key) => {
    newGrouped[key] = fn(grouped[key]);
  });
  return newGrouped;
};

export const shortTime = (isoString: string, timeZone = 'UTC') =>
  new Date(isoString).toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
  });
