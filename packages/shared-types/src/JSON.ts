import type { NestedArrays } from './Utils';

type JSONPrimitiveLeafs = boolean | string | number | null;
type JSONLeafs = JSONPrimitiveLeafs[] | JSONPrimitiveLeafs;

type JSONKey = string;

export type TypedLeafsJSONData<LeafsTypes extends JSONLeafs> = {
  [_: JSONKey]:
    | NestedArrays<TypedLeafsJSONData<LeafsTypes>>
    | TypedLeafsJSONData<LeafsTypes>[]
    | TypedLeafsJSONData<LeafsTypes>
    | NestedArrays<LeafsTypes>
    | LeafsTypes;
};

// * ... https://dev.to/ankittanna/how-to-create-a-type-for-complex-json-object-in-typescript-d81
// eslint-disable-next-line perfectionist/sort-union-types
export type JsonObj = { [_: JSONKey]: JsonObj } | Array<JsonObj> | JSONPrimitiveLeafs;
