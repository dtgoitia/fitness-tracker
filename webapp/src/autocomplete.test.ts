import { Word, buildTrie, findWords } from "./autocomplete";
import { describe, expect, it } from "vitest";

describe("Autocomplete", () => {
  const words: Word[] = ["code", "coder", "cocoa", "banana"];

  it("only matches words starting with prefix", () => {
    const trie = buildTrie(words);
    expect(findWords(trie, "co")).toEqual(new Set(["code", "coder", "cocoa"]));
  });
});
