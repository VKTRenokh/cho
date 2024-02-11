export interface Maybe<T> {
  map: <R>(fn: (_: T) => R) => Maybe<R>
  equals: (m: Maybe<unknown>) => boolean
  fmap: <R>(f: (v: T) => Maybe<R>) => Maybe<R>
  getOrElse: (dv: T) => T
  flatGetOrElse: <R>(dv: R) => R | Maybe<T>
  asyncMap: <R>(fn: (v: T) => Promise<R>) => Promise<Maybe<R>>
  merge: <R>(om: Maybe<R>) => Maybe<{ left: T; right: R }>
  value: T | null
}

export const maybe = <T>(value: T | null): Maybe<T> => ({
  map: <R>(fn: (_: T) => R) => (value ? maybe<R>(fn(value)) : maybe<R>(null)),
  equals: (m) => m.value === value,
  fmap: <R>(f: (value: T) => Maybe<R>) => (value ? f(value) : maybe<R>(null)),
  getOrElse: (dv) => (value === null ? dv : value),
  flatGetOrElse: <R>(dv: R) => (value === null ? dv : maybe<T>(value)),
  merge: <R>(om: Maybe<R>): Maybe<{ left: T; right: R }> =>
    maybe<T>(value).fmap((v: T) => om.map((ov) => ({ left: v, right: ov }))),
  asyncMap: async <R>(fn: (v: T) => Promise<R>): Promise<Maybe<R>> =>
    value === null ? maybe<R>(null) : fn(value).then((mapped) => maybe(mapped)),
  get value() {
    return value
  },
})

export const call = <T>(fn: () => T) => fn()

export const mergeMap = <L, R, N>(
  left: Maybe<L>,
  right: Maybe<R>,
  cb: (left: L, right: R) => N,
) => left.merge(right).map((maybes) => cb(maybes.left, maybes.right))

export const undefinedToMaybe = <T>(from: T | undefined): Maybe<T> => {
  const value = from ?? null

  return maybe<T>(value)
}
