export const byName = (a, b) => a.name.localeCompare(b.name);

export const unique = (v, i, arr) => {
  // compare index with first element index
  return i === arr.indexOf(v);
};

export const flatten = (arr) => arr.reduce((xs, x) => xs.concat(x), []);

export const flatMap = (arr, fn) => arr.reduce((xs, x) => xs.concat(fn(x)), []);
