import { Maybe, undefinedToMaybe } from './maybe'

export class MaybeMap<K, V> extends Map<K, V> {
  constructor(iterable: Iterable<readonly [K, V]>) {
    super(iterable)
  }

  public getMaybe(key: K): Maybe<V> {
    return undefinedToMaybe(super.get(key))
  }
}
