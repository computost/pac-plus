export function partialCopy<TObject extends Object, TKey extends keyof TObject>(
  object: TObject,
  keys: TKey[]
): TObject {
  return keys.reduce(
    (returnValue, key) => ({
      ...returnValue,
      ...(object.hasOwnProperty(key) && { [key]: object[key] }),
    }),
    {}
  ) as TObject;
}
