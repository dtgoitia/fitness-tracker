export type Word = string;

export class TrieNode {
  public children: TrieNode[] = [];
  public isEnd: boolean = false;
  constructor(readonly char: string) {}
}

function add(root: TrieNode, word: Word): void {
  let node = root;

  for (const char of word) {
    let foundInChild = false;

    for (const child of node.children) {
      if (child.char === char) {
        node = child;
        foundInChild = true;
        break;
      }
    }

    if (!foundInChild) {
      const newNode = new TrieNode(char);
      node.children.push(newNode);
      node = newNode;
    }
  }

  node.isEnd = true;
}

export function buildTrie(words: Word[]): TrieNode {
  let root = new TrieNode("");

  for (const word of words) {
    add(root, word);
  }

  return root;
}

export function findWords(trie: TrieNode, prefix: string): Set<Word> {
  let node = trie;

  // Traverse the trie checking if `prefix` exists
  if (!node.children) return new Set();

  for (const char of prefix) {
    let charNotFound = true;
    for (const child of node.children) {
      if (child.char === char) {
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

    if (node.isEnd) {
      matchedWords.add(prefix);
    }

    for (const child of node.children) {
      const newPrefix = `${prefix}${child.char}`;
      const words = matchWordsFromNode(child, newPrefix);
      for (const word of words) {
        matchedWords.add(word);
      }
    }
    return matchedWords;
  }

  return matchWordsFromNode(node, prefix);
}
