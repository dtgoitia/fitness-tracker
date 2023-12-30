import { listsAreEqual } from "./listOperations";
import { describe, expect, test } from "vitest";

describe(`list operations`, () => {
  test(`happy path`, () => {
    expect(listsAreEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });
  test(`lists with different length are not equal`, () => {
    expect(listsAreEqual([1, 2], [1])).toBe(false);
  });

  test(`lists with same length but different items`, () => {
    expect(listsAreEqual([1, 2], [1, "a"])).toBe(false);
  });

  test(`complex items considered different`, () => {
    expect(listsAreEqual([{ a: 1 }], [{ a: 1 }])).toBe(false);
  });
});
