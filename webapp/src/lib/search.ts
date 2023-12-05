import { buildTrie, findWords, TrieNode, Word } from "../autocomplete";
import { Activity, FilterQuery } from "./model";

interface WordsToItemMap {
  [w: Word]: Activity[];
}
export class ItemAutocompleter {
  private trie: TrieNode;
  private wordToItems: WordsToItemMap;
  constructor(private readonly items: Activity[]) {
    const [words, map] = this.activitiesToWords(items);
    this.trie = buildTrie(words);
    this.wordToItems = map;
  }

  public search(prefixes: string[]): Set<Activity> {
    const results: Set<Activity> = new Set();

    prefixes
      .map((prefix) => this.searchSinglePrefix(prefix))
      .map((items) => [...items])
      .flat()
      .forEach((item) => results.add(item));

    return results;
  }

  private searchSinglePrefix(prefix: string): Set<Activity> {
    const words = findWords(this.trie, prefix.toLowerCase());
    const items = this.getItemsFromWords(words);
    return items;
  }

  private activitiesToWords(activities: Activity[]): [Word[], WordsToItemMap] {
    const words: Set<Word> = new Set();
    const map: WordsToItemMap = {};

    for (const activity of activities) {
      const activityWords = this.getWordsFromActivity(activity);

      for (const word of activityWords) {
        words.add(word);

        if (!map[word]) {
          map[word] = [activity];
        } else {
          map[word].push(activity);
        }
      }
    }

    const wordList: Word[] = [...words];

    return [wordList, map];
  }

  private getWordsFromActivity(activity: Activity): Set<Word> {
    const activityWords = [activity.name, ...(activity.otherNames || [])]
      .filter((name) => name)
      .map((name) => name.toLowerCase())
      .map((name) => name.split(" "))
      .flat();

    const words = new Set(activityWords);
    return words;
  }

  private getItemsFromWords(words: Set<string>): Set<Activity> {
    const activities: Set<Activity> = new Set();

    for (const word of words) {
      const wordItems = this.wordToItems[word];
      wordItems.forEach((word) => activities.add(word));
    }

    return activities;
  }
}

export function filterInventory(activity: Activity[], query: FilterQuery): Activity[] {
  if (query === "") return activity;
  const completer = new ItemAutocompleter(activity);

  const prefixes = query.split(" ").filter((prefix) => !!prefix);
  if (!prefixes) return activity;

  const unsortedResults = completer.search(prefixes);

  return activity.filter((activity) => unsortedResults.has(activity));
}
