import type { Limit } from './Number';

export type OneOrMany<T> = T[] | T;
export type MaybeNull<T> = null | T;
export type MaybeUndefined<T> = undefined | T;
export type MaybeObjectValue<T> = MaybeUndefined<T>;
export type ObjectValue<T> = Exclude<T, undefined>;
export type NotNull<T> = Exclude<T, null>;

export type MakeHomogeneousValuesObjType<T, ObjValuesType> = {
  [K in keyof T]: T[K] extends (infer T2)[]
    ? MakeHomogeneousValuesObjType<T2, ObjValuesType>[]
    : T[K] extends object
      ? MakeHomogeneousValuesObjType<T[K], ObjValuesType>
      : ObjValuesType;
};

// NOTE: https://github.com/microsoft/TypeScript/issues/56080
// eslint-disable-next-line perfectionist/sort-intersection-types
export type Couple<Left, Right = never> = /*__CAST `never` TO__*/ [] & Right extends never ? [Left, Left] : [Left, Right];

export type NestedArrays<T> = NestedArrays<T>[] | T;

export type Bounds = {
  MIN: Limit;
  MAX: Limit;
};

export type AttemptToResultCtx = Partial<{ failureCtx: any }>;

export type ArrayElement<T extends any[]> = T extends (infer U)[] ? U : never;
