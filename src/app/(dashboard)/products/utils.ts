export const cartesian = <T extends (string | number)[][]>(...list: T): T => {
  return list.reduce<T>((acc, arr) => acc.flatMap((f) => arr.map((x) => [...f, x])) as T, [[]] as unknown as T);
};
