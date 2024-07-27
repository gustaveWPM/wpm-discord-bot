export const readonlyUniqueArray = <T extends SetSafeUniqPrimitives>(array: readonly T[]) => Object.freeze(Array.from(new Set(array)));

export const uniqueArray = <T extends SetSafeUniqPrimitives>(array: T[]) => Array.from(new Set(array));

type SetSafeUniqPrimitives = undefined | boolean | number | string | symbol | bigint | null;
