import { buildTrie, findWords, Word } from "./autocomplete";

describe("Autocomplete", () => {
  const words: Word[] = ["code", "coder", "cocoa", "banana"];

  test("only matches words starting with prefix", () => {
    const trie = buildTrie(words);
    expect(findWords(trie, "co")).toEqual(new Set(["code", "coder", "cocoa"]));
  });
});
