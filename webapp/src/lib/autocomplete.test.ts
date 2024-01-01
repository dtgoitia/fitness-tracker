import {
  Autocompleter,
  AutocompleterV2,
  Word,
  _add,
  _remove,
  addWordsToTrie,
  buildTrie,
  createNode,
  findWords,
  removeWordsFromTrie,
} from "./autocomplete";
import { now } from "./datetimeUtils";
import { ACTIVITY_PREFIX, activityToWords } from "./domain/activities";
import { Activity, ActivityName } from "./domain/model";
import { generateId } from "./hash";
import { describe, expect, test } from "vitest";

describe("TrieNode", () => {
  const words: Word[] = ["code", "coder", "cocoa", "banana"];

  test("only matches words starting with prefix", () => {
    const trie = buildTrie(words);
    expect(findWords(trie, "co")).toEqual(new Set(["code", "coder", "cocoa"]));
  });

  describe(`find words by prefix`, () => {
    test(`initialize an empty TrieNode`, () => {
      const trie = createNode();
      expect(trie).toEqual({ children: new Map(), isWordEnd: false });
    });

    test(`when there are no words to match`, () => {
      const noWords: Word[] = [];
      const trie = buildTrie(noWords);
      expect(findWords(trie, "blah")).toEqual(new Set<Word>());
    });

    test(`when no word matches the provided prefix`, () => {
      const trie = buildTrie(["bu", "bun", "bum", "be"]);
      expect(findWords(trie, "blah")).toEqual(new Set<Word>([]));
    });

    test(`when some words match the provided prefix`, () => {
      const trie = buildTrie(["bu", "bun", "bum", "be"]);
      expect(findWords(trie, "bu")).toEqual(new Set<Word>(["bu", "bun", "bum" /* be */]));
    });
  });

  describe(`add word to trie`, () => {
    test(`by mutating the trie`, () => {
      const trie = buildTrie(["bu", "bun", "bum", "be"]);
      expect(findWords(trie, "boom")).toEqual(new Set<Word>());

      _add(trie, "boomerang");
      expect(findWords(trie, "boom")).toEqual(new Set<Word>(["boomerang"]));
    });

    test(`without mutating the trie`, () => {
      const trie = buildTrie(["bu", "bun", "bum", "be"]);
      expect(findWords(trie, "boom")).toEqual(new Set<Word>());

      const updated = addWordsToTrie(trie, ["boomerang"]);
      expect(findWords(updated, "boom")).toEqual(new Set<Word>(["boomerang"]));

      // Make sure the original trie was not mutates
      expect(findWords(trie, "boom")).toEqual(new Set<Word>());
    });
  });

  describe(`remove word from trie`, () => {
    describe(`by mutating the trie`, () => {
      test(`remove word that is not in the trie`, () => {
        const trie = buildTrie(["foo", "bar"]);
        expect(findWords(trie, "foo")).toEqual(new Set<Word>(["foo"]));
        expect(findWords(trie, "bar")).toEqual(new Set<Word>(["bar"]));

        _remove(trie, "zoom");
        expect(findWords(trie, "foo")).toEqual(new Set<Word>(["foo"]));
        expect(findWords(trie, "bar")).toEqual(new Set<Word>(["bar"]));
      });

      test(`remove a standalone word`, () => {
        const trie = buildTrie(["foo", "bar"]);
        expect(findWords(trie, "foo")).toEqual(new Set<Word>(["foo"]));
        expect(findWords(trie, "bar")).toEqual(new Set<Word>(["bar"]));

        _remove(trie, "foo");
        expect(findWords(trie, "foo")).toEqual(new Set<Word>([]));
        expect(findWords(trie, "bar")).toEqual(new Set<Word>(["bar"]));
      });

      test(`remove word ending in the middle of the trie`, () => {
        const trie = buildTrie(["boom", "boomer", "be"]);
        expect(findWords(trie, "bo")).toEqual(new Set<Word>(["boom", "boomer"]));
        expect(findWords(trie, "be")).toEqual(new Set<Word>(["be"]));

        _remove(trie, "boom");
        expect(findWords(trie, "bo")).toEqual(new Set<Word>(["boomer"]));
        expect(findWords(trie, "be")).toEqual(new Set<Word>(["be"]));
      });

      test(`remove word ending in a leaf of the trie`, () => {
        const trie = buildTrie(["boom", "boomer", "be"]);
        expect(findWords(trie, "bo")).toEqual(new Set<Word>(["boom", "boomer"]));
        expect(findWords(trie, "be")).toEqual(new Set<Word>(["be"]));

        _remove(trie, "boomer");
        expect(findWords(trie, "bo")).toEqual(new Set<Word>(["boom"]));
        expect(findWords(trie, "be")).toEqual(new Set<Word>(["be"]));
      });
    });

    describe(`without mutating the trie`, () => {
      test(`remove word that is not in the trie`, () => {
        const original = buildTrie(["boom", "boomer", "be"]);
        expect(findWords(original, "bo")).toEqual(new Set<Word>(["boom", "boomer"]));
        expect(findWords(original, "be")).toEqual(new Set<Word>(["be"]));

        const updated = removeWordsFromTrie(original, ["foo"]);
        expect(findWords(updated, "bo")).toEqual(new Set<Word>(["boom", "boomer"]));
        expect(findWords(updated, "be")).toEqual(new Set<Word>(["be"]));

        // Make sure the original trie was not mutates
        expect(findWords(original, "bo")).toEqual(new Set<Word>(["boom", "boomer"]));
        expect(findWords(original, "be")).toEqual(new Set<Word>(["be"]));
      });

      test(`remove a standalone word`, () => {
        const original = buildTrie(["foo", "bar"]);
        expect(findWords(original, "foo")).toEqual(new Set<Word>(["foo"]));
        expect(findWords(original, "bar")).toEqual(new Set<Word>(["bar"]));

        const updated = removeWordsFromTrie(original, ["foo"]);
        expect(findWords(updated, "foo")).toEqual(new Set<Word>());
        expect(findWords(updated, "bar")).toEqual(new Set<Word>(["bar"]));

        // Make sure the original trie was not mutates
        expect(findWords(original, "foo")).toEqual(new Set<Word>(["foo"]));
        expect(findWords(original, "bar")).toEqual(new Set<Word>(["bar"]));
      });

      test(`remove word ending in the middle of the trie`, () => {
        const original = buildTrie(["boom", "boomer", "be"]);
        expect(findWords(original, "bo")).toEqual(new Set<Word>(["boom", "boomer"]));
        expect(findWords(original, "be")).toEqual(new Set<Word>(["be"]));

        const updated = removeWordsFromTrie(original, ["boom"]);
        expect(findWords(updated, "bo")).toEqual(new Set<Word>(["boomer"]));
        expect(findWords(updated, "be")).toEqual(new Set<Word>(["be"]));

        // Make sure the original trie was not mutates
        expect(findWords(original, "bo")).toEqual(new Set<Word>(["boom", "boomer"]));
        expect(findWords(original, "be")).toEqual(new Set<Word>(["be"]));
      });

      test(`remove word ending in a leaf of the trie`, () => {
        const original = buildTrie(["boom", "boomer", "be"]);
        expect(findWords(original, "bo")).toEqual(new Set<Word>(["boom", "boomer"]));
        expect(findWords(original, "be")).toEqual(new Set<Word>(["be"]));

        const updated = removeWordsFromTrie(original, ["boomer"]);
        expect(findWords(updated, "bo")).toEqual(new Set<Word>(["boom"]));
        expect(findWords(updated, "be")).toEqual(new Set<Word>(["be"]));

        // Make sure the original trie was not mutates
        expect(findWords(original, "bo")).toEqual(new Set<Word>(["boom", "boomer"]));
        expect(findWords(original, "be")).toEqual(new Set<Word>(["be"]));
      });
    });
  });
});

function buildActivity({ name }: { name: ActivityName }): Activity {
  return {
    id: generateId({ prefix: ACTIVITY_PREFIX }),
    name,
    otherNames: [],
    lastModified: now(),
    trainableIds: [],
  };
}

describe(Autocompleter.name, () => {
  const coder = buildActivity({ name: "Coder" });
  const code = buildActivity({ name: "Code" });
  const cocoa = buildActivity({ name: "Cocoa" });
  const banana = buildActivity({ name: "Banana" });

  describe(`search for items`, () => {
    const completer = new Autocompleter<Activity>({
      itemToWordMapper: activityToWords,
    });
    completer.initialize({ items: [coder, code, cocoa, banana] });

    test("by prefix", () => {
      const matched = completer.search(["co"]);
      expect(matched).toEqual(new Set([coder, code, cocoa]));
    });

    test("ignores case", () => {
      const uppercaseMatch = completer.search(["CO"]);
      expect(uppercaseMatch).toEqual(new Set([coder, code, cocoa]));

      const lowercaseMatch = completer.search(["co"]);
      expect(lowercaseMatch).toEqual(new Set([coder, code, cocoa]));
    });

    test("match the start of any word in the item", () => {
      const bigCocoa: Activity = buildActivity({ name: "Big cocoa" });
      const items: Activity[] = [coder, bigCocoa, banana];

      const completer = new Autocompleter<Activity>({
        itemToWordMapper: activityToWords,
      });
      completer.initialize({ items });

      const matched = completer.search(["co"]);
      expect(matched).toEqual(new Set([coder, bigCocoa]));
    });

    test("match multiple prefixes", () => {
      // let the UI split by space and pass each chunk to the autocompleter
      const prefixes: string[] = ["cod", "ban"];

      const matched = completer.search(prefixes);
      expect(matched).toEqual(new Set([coder, code, banana]));
    });
  });

  test(`add item to ${Autocompleter.name}`, () => {
    const completer = new Autocompleter<Activity>({
      itemToWordMapper: activityToWords,
    });
    completer.initialize({ items: [cocoa, code] });
    expect(completer.search(["c"])).toEqual(new Set([cocoa, code]));
    expect(completer.search(["b"])).toEqual(new Set());

    completer.addItem(banana);

    expect(completer.search(["c"])).toEqual(new Set([cocoa, code]));
    expect(completer.search(["b"])).toEqual(new Set([banana]));
  });

  test(`remove item from ${Autocompleter.name}`, () => {
    const completer = new Autocompleter<Activity>({
      itemToWordMapper: activityToWords,
    });
    completer.initialize({ items: [cocoa, code, coder, banana] });
    expect(completer.search(["c"])).toEqual(new Set([cocoa, code, coder]));
    expect(completer.search(["b"])).toEqual(new Set([banana]));

    completer.removeItem(code);

    expect(completer.search(["c"])).toEqual(new Set([cocoa, coder]));
    expect(completer.search(["b"])).toEqual(new Set([banana]));
  });
});

describe(AutocompleterV2.name, () => {
  const leftBulgarianSquat = buildActivity({ name: "left bulgarian squat" });
  const rightBulgarianSquat = buildActivity({ name: "right bulgarian squat" });

  test(`spaces behave as AND operators`, () => {
    const completer = new AutocompleterV2<Activity>({
      itemToWordMapper: activityToWords,
    });

    completer.initialize({ items: [leftBulgarianSquat, rightBulgarianSquat] });

    expect(completer.search("lef bul")).toEqual(new Set([leftBulgarianSquat]));
    expect(completer.search("lef")).toEqual(new Set([leftBulgarianSquat]));
    expect(completer.search("bul")).toEqual(
      new Set([leftBulgarianSquat, rightBulgarianSquat])
    );
  });
});
