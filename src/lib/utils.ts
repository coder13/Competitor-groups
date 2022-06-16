import { Activity, Person } from '@wca/helpers';

export const byName = (a: Person, b: Person) => a.name.localeCompare(b.name);
export const byDate = (a: Activity, b: Activity) =>
  new Date(a.startTime).getTime() - new Date(b.startTime).getTime();

Array.prototype.map;
export const unique = <T>(v: any, i: number, arr: T[]) => {
  // compare index with first element index
  return i === arr.indexOf(v);
};

export const flatten = <T>(arr: T[][]) => arr.reduce((xs, x) => xs.concat(x), []);

export const flatMap = <T>(arr: T[][], fn: (x: T[]) => T) =>
  arr.reduce((xs, x) => xs.concat(fn(x)), []);

const groupBy = <T, K extends keyof any>(xs: T[], getKey: (item: T) => K) =>
  xs.reduce((rv, x) => {
    (rv[getKey(x)] ||= []).push(x);
    return rv;
  }, {} as Record<K, T[]>);

export const shortTime = (isoString: string, timeZone = 'UTC') =>
  new Date(isoString).toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
  });
