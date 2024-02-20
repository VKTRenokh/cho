import { M } from '@victorenokh/maybe.ts'

export class MaybeMap<K, V> extends Map<K, V> {
  constructor(iterable?: Iterable<readonly [K, V]>) {
    super(iterable)
  }

  public getMaybe(key: K): M.Maybe<V> {
    return M.undefinedToMaybe(super.get(key))
  }
}
