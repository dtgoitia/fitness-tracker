import { makeTaggedUnion, MemberType, none } from "safety-match";

export type ErrorReason = string;

const ResultVariant = makeTaggedUnion({
  ok: <T>(result: T) => result,
  err: (reason: ErrorReason) => reason,
});
export const Ok = ResultVariant.ok;
export const Err = ResultVariant.err;

export type Result = MemberType<typeof ResultVariant>;

export const Maybe = makeTaggedUnion({
  Some: <T>(data: T) => data,
  None: none,
});

export type MaybeType = MemberType<typeof Maybe>;
