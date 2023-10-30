import { type Maybe } from "src/monads/maybe/types/maybe";

export const maybe = <T>(value: T | null): Maybe<T> => ({
  map: <R>(fn: (_: T) => R) => (value ? maybe(fn(value)) : maybe<R>(null)),
  ap: <R>(mfn: Maybe<(_: T) => R>) =>
    value && mfn.value ? maybe(mfn.value(value)) : maybe<R>(null),
  equals: (m) => m.value === value,
  chain: <R>(fn: (_: T) => T) => (value ? maybe(fn(value)) : maybe<R>(null)),
  fmap: <R>(f: (value: T) => Maybe<R>) => (value ? f(value) : maybe<R>(null)),
  getOrElse: (dv) => (value === null ? dv : value),
  merge<R>(otherMaybe: Maybe<R>): Maybe<[T, R]> {
    return this.fmap((v) => otherMaybe.map((ov) => [v, ov]));
  },
  asyncMap: async <R>(fn: (v: T) => Promise<R>): Promise<Maybe<R>> =>
    value === null ? maybe<R>(null) : fn(value).then((mapped) => maybe(mapped)),
  get value() {
    return value;
  },
});
