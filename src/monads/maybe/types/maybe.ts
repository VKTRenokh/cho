export interface Maybe<T> {
  map: <R>(fn: (_: T) => R) => Maybe<R>;
  ap: <R>(mfn: Maybe<(_: T) => R>) => Maybe<R>;
  equals: (m: Maybe<unknown>) => boolean;
  chain: (fn: (_: T) => T) => Maybe<T>;
  fmap: <R>(f: (v: T) => Maybe<R>) => Maybe<R>;
  getOrElse: (dv: T) => T;
  asyncMap: <R>(fn: (v: T) => Promise<R>) => Promise<Maybe<R> | Maybe<R>>;
  merge: <R>(om: Maybe<R>) => Maybe<[T, R]>;
  value: T | null;
}
