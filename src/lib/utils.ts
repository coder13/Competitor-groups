export const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

export const byDate = <T>(
  a: (T & { startTime: string }) | undefined,
  b: (T & { startTime: string }) | undefined
) => {
  const aDate = a ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  const bDate = b ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
};

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

export const groupBy = <T>(xs: T[], getKey: (x: T) => string): Record<string, T[]> =>
  xs.reduce((rv, x) => {
    (rv[getKey(x)] ||= []).push(x);
    return rv;
  }, {});

export const groupByMap = <T, S>(
  xs: T[],
  getKey: (x: T) => string,
  fn: (x: T[]) => S
): Record<string, S> => {
  const grouped = groupBy(xs, getKey);
  const newGrouped = {};
  Object.keys(grouped).forEach((key) => {
    newGrouped[key] = fn(grouped[key]);
  });
  return newGrouped;
};

export const roundTime = (date: Date, minutes: number = 5) => {
  const ms = 1000 * 60 * minutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
};
