import { union } from "./setOperations";

export type Word = string;
type Char = string; // single character string

export interface TrieNode {
  children: Map<Char, TrieNode>;
  isWordEnd: boolean;
}

/**
 * Convenient function to get list of all the words in the trie
 */
export function format(trie: TrieNode): Set<Word> {
  function _recursive_format(node: TrieNode): string[] {
    const nodeChunks: string[] = [];
    for (const [char, child] of node.children.entries()) {
      const childChunks = _recursive_format(child).map(
        (grandChildChunk) => `${char}${grandChildChunk}`
      );
      nodeChunks.push(...childChunks);

      if (child.isWordEnd && child.children.size > 0) {
        nodeChunks.push(char);
      }
    }

    if (nodeChunks.length === 0) {
      nodeChunks.push("");
    }
    return nodeChunks;
  }

  return new Set<Word>(_recursive_format(trie));
}

export function createNode(): TrieNode {
  return { children: new Map(), isWordEnd: false };
}

/**
 * Mutate the provided `TrieNode` to include a new word.
 */
export function _add(root: TrieNode, word: Word): void {
  let node = root;

  for (const char of word) {
    let foundInChild = false;

    for (const [childChar, child] of node.children.entries()) {
      if (childChar === char) {
        node = child; // <---- go down the trie
        foundInChild = true;
        break; // stop checking children, move to the next character in the word
      }
    }

    // child not found
    if (!foundInChild) {
      const newNode = createNode();
      node.children.set(char, newNode);
      node = newNode; // <---- go down the trie
    }
  }

  node.isWordEnd = true;
}

/**
 * Does not mutate the provided `TrieNode` to include a new word.
 */
export function addWordsToTrie(root: TrieNode, words: Word[]): TrieNode {
  const clone = structuredClone<TrieNode>(root);
  for (const word of words) {
    _add(clone, word);
  }
  return clone;
}

/**
 * Mutate the provided `TrieNode` to include a new word.
 */
export function _remove(root: TrieNode, word: Word): void {
  /**
   * Traverse the trie until the leave, and delete nodes from the leave to the
   * root until you find a word that has `isEnd = true`
   */

  /**
   *  words: boom, boomer, bon
   *
   *   () --- b --- o --- o --- [ m ] --- e --- [ r ]
   *                 \
   *                  \- [ n ]
   *
   *   ()   : root node
   *   [..] : is end of word
   */

  let node = root;

  let lastBranching: [Char, TrieNode] = [word[0], node];

  for (let charIndex = 0; charIndex < word.length; charIndex++) {
    const char = word[charIndex];
    const isLastChar = charIndex === word.length - 1;

    const child = node.children.get(char);
    if (child === undefined) {
      return; // word not in trie
    }

    // so far the word CAN be in trie

    if (child.isWordEnd) {
      /**
       * can still have children, e.g.: consider a trie with "boom" and "boomer"
       * "boom"
       *     |
       *     isWordEnd = T, but has children for the last 2 characters of "boomer"
       *     |
       * "boomer"
       *       |
       *       isWordEnd = T and no children  <--- this is the trie leaf
       */

      if (isLastChar) {
        child.isWordEnd = false;
        return;
      }

      if (child.children.size === 0) {
        // trie leaf - chop branch at last branching point and exit
        const [charToDrop, nodeToKeep] = lastBranching;
        nodeToKeep.children.delete(charToDrop);
        return;
      } else {
        // potential point from which you will want to delete, store it

        /**
         * look ahead and get the next character of the word
         *
         * If you need to cut the trie from now on, the current `child` will
         * become the trie leaf. To chop the undesired branch (to delete the
         * desired word), you need to remove the node stored with the character
         * `nextChar` under the `child` node.
         */
        const nextChar = word[charIndex + 1];
        lastBranching = [nextChar, child];
      }
    }

    if (isLastChar) {
      // word was not stored in the trie
      return;
    }

    node = child; // <-- keep traversing the trie
  }
}

/**
 * Does not mutate the provided `TrieNode` to remove a word.
 */
export function removeWordsFromTrie(root: TrieNode, words: Word[]): TrieNode {
  const clone = structuredClone<TrieNode>(root);
  for (const word of words) {
    _remove(clone, word);
  }
  return clone;
}

export function buildTrie(words: Word[]): TrieNode {
  let root = createNode();

  for (const word of words) {
    _add(root, word);
  }

  return root;
}

export function findWords(trie: TrieNode, prefix: string): Set<Word> {
  let node = trie;

  // Traverse the trie checking if `prefix` exists
  if (node.children.size === 0) return new Set();

  for (const char of prefix) {
    let charNotFound = true;
    for (const [childChar, child] of node.children.entries()) {
      if (childChar === char) {
        charNotFound = false;
        node = child;
        break;
      }
    }

    if (charNotFound) return new Set();
  }

  function matchWordsFromNode(root: TrieNode, prefix: string): Set<Word> {
    let matchedWords = new Set<Word>([]);

    let node = root;

    if (!node.children) return new Set<Word>([prefix]);

    if (node.isWordEnd) {
      matchedWords.add(prefix);
    }

    for (const [childChar, child] of node.children.entries()) {
      const newPrefix = `${prefix}${childChar}`;
      const words = matchWordsFromNode(child, newPrefix);
      for (const word of words) {
        matchedWords.add(word);
      }
    }
    return matchedWords;
  }

  return matchWordsFromNode(node, prefix);
}

type WordsToSearchableItemMap<Item> = Map<Word, Set<Item>>;

type ItemToWordsMapper<Item> = (searchables: Item) => Set<Word>;

interface Args<Item> {
  itemToWordMapper: ItemToWordsMapper<Item>;
}

export class Autocompleter<Item> {
  private trie: TrieNode;
  private wordToItems: WordsToSearchableItemMap<Item>;
  private getWordsFromItem: ItemToWordsMapper<Item>;

  constructor({ itemToWordMapper }: Args<Item>) {
    this.getWordsFromItem = itemToWordMapper;
    this.trie = createNode();
    this.wordToItems = new Map();
  }

  public initialize({ items }: { items: Item[] }): void {
    const [words, map] = this.analyzeWordsInItems({ items });
    this.trie = addWordsToTrie(this.trie, words);
    this.wordToItems = map;
  }

  /**
   * Add a new item to the autocompleter. This will make the item searchable via
   * the autocompleter.
   */
  public addItem(item: Item): void {
    const [words, map] = this.analyzeWordsInItems({ items: [item] });

    // include word->item mappings in autocompleter
    for (const [word, _items] of map.entries()) {
      const previousItems = this.wordToItems.get(word);
      if (previousItems === undefined) {
        this.wordToItems.set(word, _items);
      } else {
        this.wordToItems.set(word, union(previousItems, _items));
      }
    }

    this.trie = addWordsToTrie(this.trie, words);
  }

  /**
   * Add a new item to the autocompleter. This will make the item searchable via
   * the autocompleter.
   */
  public removeItem(item: Item): void {
    const wordsToDeleteFromTrie: Word[] = [];

    // drop word->item mappings from autocompleter
    for (const [word, wordItems] of this.wordToItems.entries()) {
      const deleted = wordItems.delete(item);
      /**
       * If the `Item` happened to be the only item for this `Word`, keep track
       * of this `Word` to later delete it from the `TrieNode`.
       */
      if (deleted && wordItems.size === 0) {
        wordsToDeleteFromTrie.push(word);

        // there are no more `Item`s for thiw `Word`, clean it up
        this.wordToItems.delete(word);
      }
    }

    this.trie = removeWordsFromTrie(this.trie, wordsToDeleteFromTrie);
  }

  public search(prefixes: string[]): Set<Item> {
    const results: Set<Item> = new Set();

    prefixes
      .map((prefix) => this.searchSinglePrefix(prefix))
      .map((items) => [...items])
      .flat()
      .forEach((item) => results.add(item));

    return results;
  }

  private analyzeWordsInItems({
    items,
  }: {
    items: Item[];
  }): [Word[], WordsToSearchableItemMap<Item>] {
    const words: Set<Word> = new Set();
    const map: WordsToSearchableItemMap<Item> = new Map();

    for (const item of items) {
      const itemWords = this.getWordsFromItem(item);

      for (const word of itemWords) {
        words.add(word);

        const previousItems = map.get(word);
        if (previousItems === undefined) {
          map.set(word, new Set([item]));
        } else {
          previousItems.add(item); // CAREFUL: you are mutating it
        }
      }
    }

    const wordList: Word[] = [...words];

    return [wordList, map];
  }

  private searchSinglePrefix(prefix: string): Set<Item> {
    const words = findWords(this.trie, prefix.toLowerCase());
    const items = this.getItemsFromWords(words);
    return items;
  }

  private getItemsFromWords(words: Set<string>): Set<Item> {
    const items: Set<Item> = new Set();

    for (const word of words) {
      const wordItems = this.wordToItems.get(word) || [];
      for (const wordItem of wordItems) {
        items.add(wordItem);
      }
    }

    return items;
  }
}
